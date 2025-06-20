import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail()
  @ApiProperty({ description: 'Email address of the user' })
  email: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ description: 'User password (minimum 6 characters)' })
  password: string;
}