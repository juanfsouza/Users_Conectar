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
import { ListUsersFilterDto } from '../../src/infrastructure/http/dto/list-users.dto';

describe('UsersService', () => {
  let service: UsersService;
  let createUserUseCase: CreateUserUseCase;
  let listUsersUseCase: ListUsersUseCase;
  let updateUserUseCase: UpdateUserUseCase;
  let deleteUserUseCase: DeleteUserUseCase;
  let getInactiveUsersUseCase: GetInactiveUsersUseCase;
  let findUserUseCase: FindUserUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: CreateUserUseCase,
          useValue: {
            execute: jest.fn().mockImplementation((user: User) => Promise.resolve(user)),
          },
        },
        {
          provide: ListUsersUseCase,
          useValue: {
            execute: jest.fn().mockImplementation((filter: ListUsersFilterDto, user: User) => {
              if (user.role !== 'admin') throw new ForbiddenException();
              return Promise.resolve({ users: [], total: 0 });
            }),
          },
        },
        {
          provide: UpdateUserUseCase,
          useValue: {
            execute: jest.fn().mockImplementation((id: string, user: User) => Promise.resolve(user)),
          },
        },
        {
          provide: DeleteUserUseCase,
          useValue: {
            execute: jest.fn().mockImplementation((id: string) => Promise.resolve()),
          },
        },
        {
          provide: GetInactiveUsersUseCase,
          useValue: {
            execute: jest.fn().mockImplementation(() => Promise.resolve([])),
          },
        },
        {
          provide: FindUserUseCase,
          useValue: {
            execute: jest.fn().mockImplementation((id: string) => Promise.resolve({ id } as User)),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    listUsersUseCase = module.get<ListUsersUseCase>(ListUsersUseCase);
    updateUserUseCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    deleteUserUseCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    getInactiveUsersUseCase = module.get<GetInactiveUsersUseCase>(GetInactiveUsersUseCase);
    findUserUseCase = module.get<FindUserUseCase>(FindUserUseCase);
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

  it('should throw ForbiddenException for non-admin creating admin', async () => {
    const createUserDto: CreateUserDto = { name: 'Test', email: 'test@example.com', password: 'password', role: 'admin' };
    const user = plainToClass(User, createUserDto, { excludeExtraneousValues: true }) as User;
    const currentUser = { role: 'user', id: '1' } as User;
    await expect(service.create(createUserDto, currentUser)).rejects.toThrow(ForbiddenException);
  });

  it('should list users', async () => {
    const users = [{ id: '1', name: 'Test', email: 'test@example.com', role: 'user', createdAt: new Date(), updatedAt: new Date() }] as User[];
    const currentUser = { role: 'admin', id: '1' } as User;
    jest.spyOn(listUsersUseCase, 'execute').mockResolvedValue({ users, total: 1 });

    const result = await service.findAll({} as ListUsersFilterDto, currentUser);
    expect(listUsersUseCase.execute).toHaveBeenCalled();
    expect(result).toEqual({ users, total: 1 });
  });

  it('should throw ForbiddenException for non-admin listing users', async () => {
    const currentUser = { role: 'user', id: '1' } as User;
    await expect(service.findAll({} as ListUsersFilterDto, currentUser)).rejects.toThrow(ForbiddenException);
  });

  it('should update user', async () => {
    const updateUserDto: UpdateUserDto = { name: 'Updated' };
    const user = { id: '1', name: 'Updated', email: 'test@example.com', role: 'user', createdAt: new Date(), updatedAt: new Date() } as User;
    const currentUser = { role: 'admin', id: '1' } as User;
    jest.spyOn(findUserUseCase, 'execute').mockResolvedValue(user);
    jest.spyOn(updateUserUseCase, 'execute').mockResolvedValue(user);

    const result = await service.update('1', updateUserDto, currentUser);
    expect(updateUserUseCase.execute).toHaveBeenCalledWith('1', expect.any(Object));
    expect(result).toEqual(user);
  });

  it('should throw ForbiddenException for non-admin updating user role', async () => {
    const updateUserDto: UpdateUserDto = { role: 'admin' };
    const currentUser = { role: 'user', id: '1' } as User;
    jest.spyOn(findUserUseCase, 'execute').mockResolvedValue({ id: '1', role: 'user' } as User);

    await expect(service.update('1', updateUserDto, currentUser)).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException for non-existent user update', async () => {
    const updateUserDto: UpdateUserDto = { name: 'Updated' };
    const currentUser = { role: 'admin', id: '1' } as User;
    jest.spyOn(findUserUseCase, 'execute').mockResolvedValue(Promise.resolve(null as unknown as User));

    await expect(service.update('1', updateUserDto, currentUser)).rejects.toThrow(NotFoundException);
  });

  it('should delete user', async () => {
    const currentUser = { role: 'admin', id: '1' } as User;
    jest.spyOn(deleteUserUseCase, 'execute').mockResolvedValue();

    await service.delete('1', currentUser);
    expect(deleteUserUseCase.execute).toHaveBeenCalledWith('1');
  });

  it('should throw ForbiddenException for non-admin deleting user', async () => {
    const currentUser = { role: 'user', id: '1' } as User;
    await expect(service.delete('1', currentUser)).rejects.toThrow(ForbiddenException);
  });

  it('should list inactive users', async () => {
    const users = [{ id: '1', name: 'Inactive', email: 'inactive@example.com', role: 'user', createdAt: new Date(), updatedAt: new Date() }] as User[];
    const currentUser = { role: 'admin', id: '1' } as User;
    jest.spyOn(getInactiveUsersUseCase, 'execute').mockResolvedValue(users);

    const result = await service.findInactiveUsers(currentUser);
    expect(getInactiveUsersUseCase.execute).toHaveBeenCalled();
    expect(result).toEqual(users);
  });

  it('should throw ForbiddenException for non-admin listing inactive users', async () => {
    const currentUser = { role: 'user', id: '1' } as User;
    await expect(service.findInactiveUsers(currentUser)).rejects.toThrow(ForbiddenException);
  });
});