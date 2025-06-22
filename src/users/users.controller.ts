import { Controller, Get, Post, Patch, Delete, Body, Query, Param, UseGuards, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../domain/entities/user.entity';
import { CreateUserDto } from '../infrastructure/http/dto/create-user.dto';
import { UpdateUserDto } from '../infrastructure/http/dto/update-user.dto';
import { UsersService } from './users.service';
import { ListUsersFilterDto } from '../infrastructure/http/dto/list-users.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createUserDto: CreateUserDto, @Request() req): Promise<User> {
    return this.usersService.create(createUserDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'List all users (admin only)' })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() listUsersFilterDto: ListUsersFilterDto, @Request() req): Promise<{ users: User[]; total: number }> {
    return this.usersService.findAll(listUsersFilterDto, req.user);
  }

  @Get('inactive')
  @ApiOperation({ summary: 'List inactive users (admin only)' })
  @ApiResponse({ status: 200, description: 'List of inactive users' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findInactiveUsers(@Request() req): Promise<User[]> {
    console.log('Inactive users request with user:', req.user);
    return this.usersService.findInactiveUsers(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(@Param('id') id: string, @Request() req): Promise<User> {
    return this.usersService.findById(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req): Promise<User> {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user by ID (admin only)' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@Param('id') id: string, @Request() req): Promise<void> {
    return this.usersService.delete(id, req.user);
  }

  @Post('update-last-login')
  @ApiOperation({ summary: 'Force update lastLogin for the current user' })
  @ApiResponse({ status: 200, description: 'lastLogin updated' })
  async updateLastLogin(@Request() req): Promise<{ message: string; user: User }> {
    const userId = req.user.id;
    const updatedUser = await this.usersService.update(userId, { lastLogin: new Date() } as any, req.user);
    return { message: 'lastLogin updated successfully', user: updatedUser };
  }
}