import { Inject, Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(filters: { role?: string; sortBy?: string; order?: 'asc' | 'desc'; page?: number; limit?: number }): Promise<{ users: User[]; total: number }> {
    return this.userRepository.findAll(filters);
  }
}