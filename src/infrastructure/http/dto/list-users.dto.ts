import { IsString, IsEnum, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ListUsersFilterDto {
  @IsEnum(['admin', 'user'])
  @IsOptional()
  @ApiProperty({ description: 'Filter by user role', enum: ['admin', 'user'], required: false })
  role?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Sort by field (name or createdAt)', required: false })
  sortBy?: string;

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
}