import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/entities/user.entity';
import { validate as uuidValidate } from 'uuid';

@Injectable()
export class UpdateLastLoginMiddleware implements NestMiddleware {
  private readonly logger = new Logger(UpdateLastLoginMiddleware.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    this.logger.log('Checking token in middleware:', req.headers, req.cookies);

    const token = req.cookies['accessToken'] || (req.headers.authorization?.split(' ')[1] || null);

    if (token) {
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const { sub: id } = payload;

        if (id && uuidValidate(id)) {
          const result = await this.usersRepository.update(id, { lastLogin: new Date(), updatedAt: new Date() });
          if (result.affected === 0) {
            this.logger.warn('No rows updated for user in middleware:', id);
          } else {
            this.logger.log('Successfully updated lastLogin in middleware for user:', id, 'Affected rows:', result.affected);
          }
          const updatedUser = await this.usersRepository.findOne({ where: { id } });
          this.logger.log('Updated user data in middleware:', updatedUser);
        }
      } catch (error) {
        this.logger.error('Failed to update lastLogin in middleware:', error);
      }
    }

    next();
  }
}