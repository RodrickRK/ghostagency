import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import bcrypt from 'bcrypt';
import * as schema from '../shared/schema';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = 'admin@ghostagency.com';
const ADMIN_PASSWORD = 'adminpass123'; // Change this in production
const EMPLOYEE_EMAIL = 'employee@ghostagency.com';
const EMPLOYEE_PASSWORD = 'employeepass123'; // Change this in production

async function seed() {
  if (!process.env.NETLIFY_DATABASE_URL_UNPOOLED) {
    throw new Error('NETLIFY_DATABASE_URL_UNPOOLED environment variable is required');
  }

  const sql = neon(process.env.NETLIFY_DATABASE_URL_UNPOOLED);
  const db = drizzle(sql, { schema });

  try {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const adminExists = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, ADMIN_EMAIL)
    });

    if (!adminExists) {
      const hashedAdminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await db.insert(schema.users).values({
        email: ADMIN_EMAIL,
        password: hashedAdminPassword,
        name: 'Admin User',
        role: 'admin'
      });
      console.log('👤 Created admin user');
    } else {
      console.log('👤 Admin user already exists');
    }

    // Create employee user
    const employeeExists = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, EMPLOYEE_EMAIL)
    });

    if (!employeeExists) {
      const hashedEmployeePassword = await bcrypt.hash(EMPLOYEE_PASSWORD, 10);
      await db.insert(schema.users).values({
        email: EMPLOYEE_EMAIL,
        password: hashedEmployeePassword,
        name: 'Employee User',
        role: 'employee'
      });
      console.log('👤 Created employee user');
    } else {
      console.log('👤 Employee user already exists');
    }

    console.log('✅ Seed completed successfully');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });