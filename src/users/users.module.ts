import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { CreateUserUseCase } from 'src/application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from 'src/application/use-cases/delete-user.use-case';
import { GetInactiveUsersUseCase } from 'src/application/use-cases/get-inactive-users.use-case';
import { ListUsersUseCase } from 'src/application/use-cases/list-users.use-case';
import { UpdateUserUseCase } from 'src/application/use-cases/update-user.use-case';
import { TypeOrmUserRepository } from 'src/infrastructure/persistence/typeorm-user.repository';
import { User } from '../domain/entities/user.entity';
import { FindUserUseCase } from 'src/application/use-cases/find-user.use-case';
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