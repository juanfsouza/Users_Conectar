import { User } from '../entities/user.entity';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(filters?: { role?: string; sortBy?: string; order?: 'asc' | 'desc'; page?: number; limit?: number }): Promise<{ users: User[]; total: number }>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  findInactiveUsers(days: number): Promise<User[]>;
}