import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './domain/entities/user.entity';

export default new DataSource({
  type: 'postgres',
  host: new ConfigService().get<string>('DB_HOST') || 'localhost',
  port: new ConfigService().get<number>('DB_PORT') || 5432,
  username: new ConfigService().get<string>('DB_USERNAME') || 'postgres',
  password: new ConfigService().get<string>('DB_PASSWORD') || '123',
  database: new ConfigService().get<string>('DB_NAME') || 'connectar',
  synchronize: false,
  logging: true,
  entities: [User],
  migrations: ['src/migrations/*.ts'],
});