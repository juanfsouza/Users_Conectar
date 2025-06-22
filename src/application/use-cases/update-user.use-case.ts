import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, user: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    console.log('UpdateUserUseCase - Input user data:', user);

    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }

    if (user.role) {
      existingUser.role = user.role;
    }

    Object.assign(existingUser, user);

    console.log('User before save:', existingUser);
    const updatedUser = await this.userRepository.update(id, existingUser);
    console.log('User after save:', updatedUser);

    return updatedUser;
  }
}