import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from '../application/use-cases/delete-user.use-case';
import { GetInactiveUsersUseCase } from '../application/use-cases/get-inactive-users.use-case';
import { ListUsersUseCase } from '../application/use-cases/list-users.use-case';
import { UpdateUserUseCase } from '../application/use-cases/update-user.use-case';
import { TypeOrmUserRepository } from '../infrastructure/persistence/typeorm-user.repository';
import { User } from '../domain/entities/user.entity';
import { FindUserUseCase } from '../application/use-cases/find-user.use-case';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'IUserRepository',
      useClass: TypeOrmUserRepository,
    },
    CreateUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    GetInactiveUsersUseCase,
    FindUserUseCase,
  ],
  exports: [UsersService],
})
export class UsersModule {}