const { DataSource } = require('typeorm');
const dotenv = require('dotenv');
dotenv.config();

module.exports = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'conectar',
  synchronize: false,
  logging: true,
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
  entities: [__dirname + '/domain/entities/*.entity.{js,ts}'],
  migrations: [__dirname + '/migrations/*.{js,ts}'],
});
