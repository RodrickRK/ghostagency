import { config } from 'dotenv';
config(); // Load environment variables first

import { db, getUnpooledClient } from './index';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function testDatabaseConnection() {
  console.log('Testing database connections...');
  
  try {
    // Test pooled connection (default)
    console.log('\n1. Testing pooled connection:');
    
    // First, try to create a test user
    const insertResult = await db.insert(users).values({
      email: 'test@example.com',
      password: 'test123',
      name: 'Test User',
      role: 'client'
    }).returning();
    console.log('✅ Pooled connection insert successful');
    console.log('Inserted user:', insertResult);

    // Then try to read it back
    const result = await db.select().from(users).limit(1);
    console.log('✅ Pooled connection select successful');
    console.log('Sample query result:', result);

    // Test unpooled connection
    console.log('\n2. Testing unpooled connection:');
    const unpooledDb = getUnpooledClient();
    const unpooledResult = await unpooledDb.select().from(users).limit(1);
    console.log('✅ Unpooled connection successful');
    console.log('Sample query result:', unpooledResult);

    // Clean up test data
    if (insertResult.length > 0) {
      await db.delete(users).where(eq(users.id, insertResult[0].id));
      console.log('✅ Test data cleaned up');
    }

  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    throw error;
  }
}

// Run the test
testDatabaseConnection()
  .then(() => console.log('\n✨ All database tests passed!'))
  .catch((error) => {
    console.error('\n❌ Database tests failed:', error);
    process.exit(1);
  });