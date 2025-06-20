import { DataSource } from 'typeorm';
import { User } from '../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function runSeed(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const adminEmail = 'admin@example.com';
  const existingAdmin = await userRepository.findOne({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = userRepository.create({
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    await userRepository.save(adminUser);
    console.log('Admin user created successfully:', adminEmail);
  } else {
    console.log('Admin user already exists:', adminEmail);
  }
}

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '123',
    database: process.env.DB_NAME || 'connectar',
    synchronize: false,
    entities: [User],
    migrations: ['src/migrations/*.ts'],
  });

  try {
    await dataSource.initialize();
    await runSeed(dataSource);
  } catch (error) {
    console.error('Error running seed:', error);
  } finally {
    await dataSource.destroy();
  }
}

main();