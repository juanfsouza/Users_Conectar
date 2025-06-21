import { DataSource } from 'typeorm';
import { User } from '../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

async function runSeed(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const adminEmail = 'admin@examplee.com';
  const existingAdmin = await userRepository.findOne({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin1234', 10);
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
  const configService = new ConfigService();
  const dataSource = new DataSource({
    type: 'postgres',
    url: configService.get<string>('DATABASE_URL'),
    ssl: { rejectUnauthorized: false },
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