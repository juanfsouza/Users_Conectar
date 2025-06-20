import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from 'src/application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from 'src/application/use-cases/delete-user.use-case';
import { GetInactiveUsersUseCase } from 'src/application/use-cases/get-inactive-users.use-case';
import { ListUsersUseCase } from 'src/application/use-cases/list-users.use-case';
import { UpdateUserUseCase } from 'src/application/use-cases/update-user.use-case';


describe('UsersService', () => {
  let service: UsersService;
  let createUserUseCase: CreateUserUseCase;
  let listUsersUseCase: ListUsersUseCase;

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
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    createUserUseCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    listUsersUseCase = module.get<ListUsersUseCase>(ListUsersUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call createUserUseCase.execute when creating a user', async () => {
    const user = { name: 'Test User', email: 'test@example.com', password: 'password', role: 'user' } as User;
    const currentUser = { role: 'admin', id: '1' } as User;
    jest.spyOn(createUserUseCase, 'execute').mockResolvedValue(user);

    const result = await service.create(user, currentUser);
    expect(createUserUseCase.execute).toHaveBeenCalledWith(user);
    expect(result).toEqual(user);
  });

  it('should throw ForbiddenException when non-admin tries to list users', async () => {
    const currentUser = { role: 'user', id: '1' } as User;
    await expect(service.findAll({}, currentUser)).rejects.toThrow('Only admins can list all users');
  });
});