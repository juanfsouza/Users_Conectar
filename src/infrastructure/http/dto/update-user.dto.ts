import { IsString, IsEmail, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Full name of the user', required: false })
  name?: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({ description: 'Email address of the user', required: false })
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  @ApiProperty({ description: 'User password (minimum 6 characters)', required: false })
  password?: string;

  @IsEnum(['admin', 'user'])
  @IsOptional()
  @ApiProperty({ description: 'Role of the user', enum: ['admin', 'user'], required: false })
  role?: 'admin' | 'user';
}