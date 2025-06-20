import { Strategy, Profile } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || 'your-google-client-id',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || 'your-google-client-secret',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3001/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<User> {
    const { name, emails } = profile;
    const email = emails && emails.length > 0 ? emails[0].value : null;

    if (!email) {
      throw new UnauthorizedException('No email found in Google profile');
    }

    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      user = this.userRepository.create({
        name: name?.givenName || profile.displayName,
        email,
        role: 'user',
        password: undefined,
      });
      await this.userRepository.save(user);
    }

    return user;
  }
}