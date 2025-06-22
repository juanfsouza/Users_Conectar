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
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid'; // Adiciona suporte a UUID

describe('UsersService', () => {
  let service: UsersService;
  let createUserUseCase: CreateUserUseCase;
  let listUsersUseCase: ListUsersUseCase;
  let updateUserUseCase: UpdateUserUseCase;
  let deleteUserUseCase: DeleteUserUseCase;
  let getInactiveUsersUseCase: GetInactiveUsersUseCase;
  let findUserUseCase: FindUserUseCase;
  let userRepository: Repository<User>;

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
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            findOneOrFail: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
              update: jest.fn().mockReturnThis(),
              delete: jest.fn().mockReturnThis(),
            }),
            update: jest.fn(),
            delete: jest.fn(),
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
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const createUserDto: CreateUserDto = { name: 'Test User', email: 'test@example.com', password: 'password', role: 'user' };
    const user = plainToClass(User, createUserDto, { excludeExtraneousValues: true }) as User;
    const currentUser = { role: 'admin', id: uuidv4() } as User;
    jest.spyOn(createUserUseCase, 'execute').mockResolvedValue(user);

    const result = await service.create(createUserDto, currentUser);
    expect(createUserUseCase.execute).toHaveBeenCalledWith(user);
    expect(result).toEqual(user);
  });

  it('should throw ForbiddenException for non-admin creating admin', async () => {
    const createUserDto: CreateUserDto = { name: 'Test', email: 'test@example.com', password: 'password', role: 'admin' };
    const user = plainToClass(User, createUserDto, { excludeExtraneousValues: true }) as User;
    const currentUser = { role: 'user', id: uuidv4() } as User;
    await expect(service.create(createUserDto, currentUser)).rejects.toThrow(ForbiddenException);
  });

  it('should list users with filters', async () => {
    const users = [{ id: uuidv4(), name: 'Test', email: 'test@example.com', role: 'user', createdAt: new Date(), updatedAt: new Date(), lastLogin: new Date() }] as User[];
    const currentUser = { role: 'admin', id: uuidv4() } as User;
    const filters: ListUsersFilterDto = { lastLogin: 'last7' };
    jest.spyOn(userRepository.createQueryBuilder(), 'getManyAndCount').mockResolvedValue([users, 1]);

    const result = await service.findAll(filters, currentUser);
    expect(userRepository.createQueryBuilder).toHaveBeenCalled();
    expect(result).toEqual({ users, total: 1 });
  });

  it('should throw ForbiddenException for non-admin listing users', async () => {
    const currentUser = { role: 'user', id: uuidv4() } as User;
    await expect(service.findAll({} as ListUsersFilterDto, currentUser)).rejects.toThrow(ForbiddenException);
  });

  it('should find user by id', async () => {
    const userId = uuidv4();
    const user: User = { id: userId, name: 'Test', email: 'test@example.com', role: 'user', createdAt: new Date(), updatedAt: new Date() } as User;
    const currentUser = { role: 'admin', id: uuidv4() } as User;
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

    const result = await service.findById(userId, currentUser);
    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    expect(result).toEqual(user);
  });

  it('should throw NotFoundException for invalid id', async () => {
    const currentUser = { role: 'admin', id: uuidv4() } as User;
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

    await expect(service.findById('invalid-id', currentUser)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException for non-owner viewing', async () => {
    const userId = uuidv4();
    const user: User = { id: userId, name: 'Test', email: 'test@example.com', role: 'user', createdAt: new Date(), updatedAt: new Date() } as User;
    const currentUser = { role: 'user', id: uuidv4() } as User; // Diferente do ID do usuário
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

    await expect(service.findById(userId, currentUser)).rejects.toThrow(ForbiddenException);
  });

  it('should update user', async () => {
    const userId = uuidv4();
    const updateUserDto: UpdateUserDto = { name: 'Updated' };
    const user = { id: userId, name: 'Updated', email: 'test@example.com', role: 'user', createdAt: new Date(), updatedAt: new Date() } as User;
    const currentUser = { role: 'admin', id: uuidv4() } as User;
    jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue(user);
    jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 1 } as any);
    jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue(user);

    const result = await service.update(userId, updateUserDto, currentUser);
    expect(userRepository.update).toHaveBeenCalledWith(userId, expect.any(Object));
    expect(result).toEqual(user);
  });

  it('should throw ForbiddenException for non-admin updating role', async () => {
    const userId = uuidv4();
    const updateUserDto: UpdateUserDto = { role: 'admin' };
    const currentUser = { role: 'user', id: uuidv4() } as User;
    jest.spyOn(userRepository, 'findOneOrFail').mockResolvedValue({ id: userId, role: 'user' } as User);

    await expect(service.update(userId, updateUserDto, currentUser)).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException for non-existent user update', async () => {
    const userId = uuidv4();
    const updateUserDto: UpdateUserDto = { name: 'Updated' };
    const currentUser = { role: 'admin', id: uuidv4() } as User;
    jest.spyOn(userRepository, 'findOneOrFail').mockRejectedValue(new NotFoundException());

    await expect(service.update(userId, updateUserDto, currentUser)).rejects.toThrow(NotFoundException);
  });

  it('should delete user', async () => {
    const userId = uuidv4();
    const currentUser = { role: 'admin', id: uuidv4() } as User;
    jest.spyOn(userRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

    await service.delete(userId, currentUser);
    expect(userRepository.delete).toHaveBeenCalledWith(userId);
  });

  it('should throw ForbiddenException for non-admin deleting user', async () => {
    const userId = uuidv4();
    const currentUser = { role: 'user', id: uuidv4() } as User;
    await expect(service.delete(userId, currentUser)).rejects.toThrow(ForbiddenException);
  });

  it('should list inactive users', async () => {
    const users = [{ id: uuidv4(), name: 'Inactive', email: 'inactive@example.com', role: 'user', createdAt: new Date(), updatedAt: new Date() }] as User[];
    const currentUser = { role: 'admin', id: uuidv4() } as User;
    jest.spyOn(getInactiveUsersUseCase, 'execute').mockResolvedValue(users);

    const result = await service.findInactiveUsers(currentUser);
    expect(getInactiveUsersUseCase.execute).toHaveBeenCalled();
    expect(result).toEqual(users);
  });

  it('should throw ForbiddenException for non-admin listing inactive users', async () => {
    const currentUser = { role: 'user', id: uuidv4() } as User;
    await expect(service.findInactiveUsers(currentUser)).rejects.toThrow(ForbiddenException);
  });
});