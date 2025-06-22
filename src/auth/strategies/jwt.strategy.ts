import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validate as uuidValidate } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req) => {
        console.log('Extracting token from request:', req?.cookies);
        let token = null;
        if (req && req.cookies) {
          token = req.cookies['accessToken'];
          console.log('Extracted token:', token);
        }
        return token;
      }]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secretKey',
    });
  }

  async validate(payload: any): Promise<{ id: string; email: string; role: string }> {
    console.log('Validating JWT payload:', payload);
    const { sub: id, email, role } = payload;

    if (!id || !uuidValidate(id)) {
      console.error('Invalid UUID in payload:', id);
      throw new UnauthorizedException('Invalid user ID in token');
    }

    if (!email || !role) {
      console.error('Missing required fields in payload:', payload);
      throw new UnauthorizedException('Invalid token payload');
    }

    try {
      await this.usersRepository.update(id, { lastLogin: new Date(), updatedAt: new Date() });
      console.log('Updated lastLogin for user:', id);
    } catch (error) {
      console.error('Failed to update lastLogin:', error);
    }

    return { id, email, role };
  }
}