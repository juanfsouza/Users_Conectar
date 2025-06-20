import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from '../../src/application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from '../../src/application/use-cases/delete-user.use-case';
import { FindUserUseCase } from '../../src/application/use-cases/find-user.use-case';
import { GetInactiveUsersUseCase } from '../../src/application/use-cases/get-inactive-users.use-case';
import { ListUsersUseCase } from '../../src/application/use-cases/list-users.use-case';
import { UpdateUserUseCase } from '../../src/application/use-cases/update-user.use-case';
import { User } from '../../src/domain/entities/user.entity';
import { UsersService } from '../../src/users/users.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateUserDto } from '../../src/infrastructure/http/dto/create-user.dto';
import { UpdateUserDto } from '../../src/infrastructure/http/dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let createUserUseCase: CreateUserUseCase;
  let findUserUseCase: FindUserUseCase;
  let updateUserUseCase: UpdateUserUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: CreateUserUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ListUsersUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdateUserUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteUserUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetInactiveUsersUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindUserUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    findUserUseCase = module.get<FindUserUseCase>(FindUserUseCase);
    updateUserUseCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const createUserDto: CreateUserDto = { name: 'Test User', email: 'test@example.com', password: 'password', role: 'user' };
    const user = plainToClass(User, createUserDto, { excludeExtraneousValues: true }) as User;
    const currentUser = { role: 'admin', id: '1' } as User;
    jest.spyOn(createUserUseCase, 'execute').mockResolvedValue(user);

    const result = await service.create(createUserDto, currentUser);
    expect(createUserUseCase.execute).toHaveBeenCalledWith(user);
    expect(result).toEqual(user);
  });

  it('should throw ForbiddenException for non-admin listing users', async () => {
    const currentUser = { role: 'user', id: '1' } as User;
    await expect(service.findAll({}, currentUser)).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException for non-existent user update', async () => {
    const currentUser = { role: 'admin', id: '1' } as User;
    const updateUserDto: UpdateUserDto = { name: 'Updated' };
    jest.spyOn(findUserUseCase, 'execute').mockResolvedValue(null as unknown as User);

    await expect(service.update('1', updateUserDto, currentUser)).rejects.toThrow(NotFoundException);
  });
});