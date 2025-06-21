import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({ example: 'Admin User', description: 'The name of the admin' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'admin@example.com', description: 'The email of the admin' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123', description: 'The password of the admin' })
  @IsString()
  @MinLength(6)
  password: string;
}