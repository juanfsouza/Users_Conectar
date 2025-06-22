import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/entities/user.entity';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from '../application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../application/use-cases/delete-user.use-case';
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
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser: { id: string; role: string; email: string }): Promise<User> {
    if (currentUser.role !== 'admin' && createUserDto.role === 'admin') {
      throw new ForbiddenException('Only admins can create admin users');
    }
    const user = plainToClass(User, createUserDto, { excludeExtraneousValues: true });
    return this.createUserUseCase.execute(user);
  }

  async findAll(filters: ListUsersFilterDto, currentUser: { id: string; role: string; email: string }): Promise<{ users: User[]; total: number }> {
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can list all users');
    }
    const query = this.userRepository.createQueryBuilder('user');
    if (filters.role) query.andWhere('user.role = :role', { role: filters.role });
    if (filters.sortBy) query.orderBy(`user.${filters.sortBy}`, filters.order?.toUpperCase() as 'ASC' | 'DESC' || 'ASC');
    const page = filters.page ?? 1;
    query.skip((page - 1) * (filters.limit || 10)).take(filters.limit || 10);
    const [users, total] = await query.getManyAndCount();
    return { users, total };
  }

  async findById(id: string, currentUser: { id: string; role: string; email: string }): Promise<User> {
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
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can delete users');
    }
    await this.userRepository.delete(id);
  }

  async findInactiveUsers(currentUser: { id: string; role: string; email: string }): Promise<User[]> {
    console.log('Fetching inactive users for user:', currentUser.email);
    if (currentUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can view inactive users');
    }
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - 30);
    const inactiveUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.lastLogin IS NULL OR user.lastLogin < :date', { date: dateThreshold })
      .getMany();
    console.log('Inactive users fetched:', inactiveUsers);
    return inactiveUsers;
  }
}