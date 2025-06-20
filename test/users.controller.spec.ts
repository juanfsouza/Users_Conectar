import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from 'src/infrastructure/http/dto/create-user.dto';
import { ListUsersDto } from 'src/infrastructure/http/dto/list-users.dto';
import { UsersController } from 'src/users/users.controller';


describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findInactiveUsers: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a user', async () => {
    const userDto: CreateUserDto = { name: 'Test', email: 'test@example.com', password: 'password123', role: 'user' };
    const user: User = { id: '1', ...userDto, createdAt: new Date(), updatedAt: new Date() } as User;
    jest.spyOn(service, 'create').mockResolvedValue(user);

    const result = await controller.create(userDto, { user: { role: 'admin', id: '1' } } as any);
    expect(service.create).toHaveBeenCalledWith(userDto, expect.anything());
    expect(result).toEqual(user);
  });

  it('should list users', async () => {
    const users = [{ id: '1', name: 'Test', email: 'test@example.com', role: 'user', createdAt: new Date(), updatedAt: new Date() }] as User[];
    jest.spyOn(service, 'findAll').mockResolvedValue({ users, total: 1 });

    const result = await controller.findAll({} as ListUsersDto, { user: { role: 'admin', id: '1' } } as any);
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual({ users, total: 1 });
  });
});