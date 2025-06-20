const { DataSource } = require('typeorm');
const dotenv = require('dotenv');
dotenv.config();

module.exports = new DataSource({
  type: 'postgres',
  url: process.env.DIRECT_URL,
  host: process.env.DB_HOST || 'aws-0-sa-east-1.pooler.supabase.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres.drrmcieepvakoepjqfax',
  password: process.env.DB_PASSWORD || 'qwaszxc123@',
  database: process.env.DB_NAME || 'postgres',
  synchronize: false,
  logging: true,
  entities: [require('./domain/entities/user.entity')],
  migrations: ['src/migrations/*.ts'],
});