import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier of the user' })
  id: string;

  @Column()
  @ApiProperty({ description: 'Full name of the user' })
  name: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'Email address of the user' })
  email: string;

  @Column()
  @ApiProperty({ description: 'Hashed password of the user' })
  password: string;

  @Column({ default: 'user' })
  @ApiProperty({ description: 'Role of the user (admin or user)' })
  role: 'admin' | 'user';

  @CreateDateColumn()
  @ApiProperty({ description: 'Creation date of the user' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Last update date of the user' })
  updatedAt: Date;

  @Column({ nullable: true })
  @ApiProperty({ description: 'Last login date of the user' })
  lastLogin?: Date;
}