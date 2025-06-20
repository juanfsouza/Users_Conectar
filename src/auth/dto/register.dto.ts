import { IsString, IsEmail, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsString()
  @ApiProperty({ description: 'Full name of the user' })
  name: string;

  @IsEmail()
  @ApiProperty({ description: 'Email address of the user' })
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ description: 'User password (minimum 6 characters)' })
  password: string;

  @IsEnum(['admin', 'user'])
  @ApiProperty({ description: 'Role of the user', enum: ['admin', 'user'] })
  role: 'admin' | 'user';
}