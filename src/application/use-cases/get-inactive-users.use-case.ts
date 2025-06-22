import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class GetInactiveUsersUseCase {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async execute(daysThreshold: number = 30): Promise<User[]> {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

    const inactiveUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.lastLogin IS NULL OR user.lastLogin < :threshold', { threshold: thresholdDate })
      .getMany();

    return inactiveUsers;
  }
}