import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { ListUsersUseCase } from '../application/use-cases/list-users.use-case';
import { UpdateUserUseCase } from '../application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../application/use-cases/delete-user.use-case';
import { GetInactiveUsersUseCase } from '../application/use-cases/get-inactive-users.use-case';
import { User } from '../domain/entities/user.entity';
import { plainToClass } from 'class-transformer';
import { CreateUserDto } from '../infrastructure/http/dto/create-user.dto';
import { UpdateUserDto } from '../infrastructure/http/dto/update-user.dto';
import { FindUserUseCase } from '../application/use-cases/find-user.use-case';
import { ListUsersFilterDto } from '../infrastructure/http/dto/list-users.dto';
import { validate as uuidValidate } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly getInactiveUsersUseCase: GetInactiveUsersUseCase,
    private readonly findUserUseCase: FindUserUseCase,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser: User): Promise<User> {
    if (currentUser.role !== 'admin' && createUserDto.role === 'admin') {
      throw new ForbiddenException('Only admins can create admin users');
    }
    const user = plainToClass(User, createUserDto, { excludeExtraneousValues: true });
    return this.createUserUseCase.execute(user);
  }

  async findAll(filters: ListUsersFilterDto, currentUser: User): Promise<{ users: User[]; total: number }> {
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can list all users');
    }
    return this.listUsersUseCase.execute(filters);
  }

  async findById(id: string, currentUser: User): Promise<User> {
    if (!uuidValidate(id)) {
      throw new NotFoundException('Invalid user ID');
    }
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new ForbiddenException('Users can only view their own profile');
    }
    const user = await this.findUserUseCase.execute(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: User): Promise<User> {
    console.log('UsersService - Update DTO:', updateUserDto);
    if (!uuidValidate(id)) {
      throw new NotFoundException('Invalid user ID');
    }
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new ForbiddenException('Users can only update their own profile');
    }
    if (currentUser.role !== 'admin' && updateUserDto.role === 'admin') {
      throw new ForbiddenException('Only admins can update user roles');
    }
    const user = plainToClass(User, updateUserDto, { excludeExtraneousValues: true }) as Partial<User>;
    console.log('UsersService - Transformed user:', user);
    const existingUser = await this.findById(id, currentUser);
    return this.updateUserUseCase.execute(id, user);
  }

  async delete(id: string, currentUser: User): Promise<void> {
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can delete users');
    }
    return this.deleteUserUseCase.execute(id);
  }

  async findInactiveUsers(currentUser: User): Promise<User[]> {
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can view inactive users');
    }
    console.log('Fetching inactive users for user:', currentUser.email);
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - 30);
    const allUsers = await this.listUsersUseCase.execute({ limit: 100 }); // Usa listUsersUseCase
    const inactiveUsers = allUsers.users.filter(user => !user.lastLogin || new Date(user.lastLogin) < dateThreshold);
    console.log('Inactive users fetched:', inactiveUsers);
    return inactiveUsers;
  }
}