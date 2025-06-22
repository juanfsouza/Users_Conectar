import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/entities/user.entity';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../application/use-cases/delete-user.use-case';
import { GetInactiveUsersUseCase } from '../application/use-cases/get-inactive-users.use-case';
import { plainToClass } from 'class-transformer';
import { CreateUserDto } from '../infrastructure/http/dto/create-user.dto';
import { UpdateUserDto } from '../infrastructure/http/dto/update-user.dto';
import { ListUsersFilterDto } from '../infrastructure/http/dto/list-users.dto';
import { validate as uuidValidate } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly getInactiveUsersUseCase: GetInactiveUsersUseCase,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser: { id: string; role: string; email: string }): Promise<User> {
    console.log('Creating user with currentUser:', currentUser);
    if (currentUser.role !== 'admin' && createUserDto.role === 'admin') {
      throw new ForbiddenException('Only admins can create admin users');
    }
    const user = plainToClass(User, createUserDto, { excludeExtraneousValues: true });
    return this.createUserUseCase.execute(user);
  }

  async findAll(filters: ListUsersFilterDto, currentUser: { id: string; role: string; email: string }): Promise<{ users: User[]; total: number }> {
    console.log('Finding all users with currentUser:', currentUser);
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can list all users');
    }
    const query = this.userRepository.createQueryBuilder('user');
    if (filters.role) query.andWhere('user.role = :role', { role: filters.role });
    if (filters.lastLogin) {
      const now = new Date();
      if (filters.lastLogin === 'never') {
        query.andWhere('user.lastLogin IS NULL');
      } else if (filters.lastLogin === 'last7') {
        const threshold = new Date(now.setDate(now.getDate() - 7));
        query.andWhere('user.lastLogin >= :threshold', { threshold });
      } else if (filters.lastLogin === 'over30') {
        const threshold = new Date(now.setDate(now.getDate() - 30));
        query.andWhere('user.lastLogin < :threshold OR user.lastLogin IS NULL', { threshold });
      }
    }
    if (filters.sortBy) query.orderBy(`user.${filters.sortBy}`, filters.order?.toUpperCase() as 'ASC' | 'DESC' || 'ASC');
    const page = filters.page ?? 1;
    query.skip((page - 1) * (filters.limit || 10)).take(filters.limit || 10);
    const [users, total] = await query.getManyAndCount();
    return { users, total };
  }

  async findById(id: string, currentUser: { id: string; role: string; email: string }): Promise<User> {
    console.log('Finding user by id:', id, 'with currentUser:', currentUser);
    if (!uuidValidate(id)) {
      throw new NotFoundException('Invalid user ID');
    }
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new ForbiddenException('Users can only view their own profile');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: { id: string; role: string; email: string }): Promise<User> {
    console.log('Updating user with id:', id, 'currentUser:', currentUser);
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
    await this.userRepository.update(id, user);
    return this.userRepository.findOneOrFail({ where: { id } });
  }

  async delete(id: string, currentUser: { id: string; role: string; email: string }): Promise<void> {
    console.log('Deleting user with id:', id, 'currentUser:', currentUser);
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can delete users');
    }
    await this.userRepository.delete(id);
  }

  async findInactiveUsers(currentUser: { id: string; role: string; email: string }): Promise<User[]> {
    console.log('findInactiveUsers called with currentUser:', currentUser);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can view inactive users');
    }
    return this.getInactiveUsersUseCase.execute(30);
  }
}