// src/infrastructure/http/dto/list-users.dto.ts
import { IsString, IsEnum, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ListUsersFilterDto {
  @IsEnum(['admin', 'user'])
  @IsOptional()
  @ApiProperty({ description: 'Filter by user role', enum: ['admin', 'user'], required: false })
  role?: string;

  @IsEnum(['name', 'createdAt', 'lastLogin'])
  @IsOptional()
  @ApiProperty({ description: 'Sort by field (name, createdAt, or lastLogin)', enum: ['name', 'createdAt', 'lastLogin'], required: false })
  sortBy?: 'name' | 'createdAt' | 'lastLogin';

  @IsEnum(['asc', 'desc'])
  @IsOptional()
  @ApiProperty({ description: 'Sort order', enum: ['asc', 'desc'], required: false })
  order?: 'asc' | 'desc';

  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiProperty({ description: 'Page number', required: false })
  page?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @ApiProperty({ description: 'Number of items per page', required: false })
  limit?: number;

  @IsEnum(['never', 'last7', 'over30'])
  @IsOptional()
  @ApiProperty({ 
    description: 'Filter by last login status', 
    enum: ['never', 'last7', 'over30'], 
    required: false,
    'x-enumNames': ['Never logged in', 'Logged in last 7 days', 'Inactive for over 30 days']
  })
  lastLogin?: 'never' | 'last7' | 'over30';
}