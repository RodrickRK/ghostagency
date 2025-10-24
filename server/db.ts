import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";
import { config } from "dotenv";

// Load .env in development
if (process.env.NODE_ENV !== 'production') {
  config();
}

// Configure Neon client
neonConfig.fetchConnectionCache = true;
neonConfig.useSecureWebSocket = true;

function getDbUrl(): string {
  // For serverless functions, use pooled connection
  if (process.env.NETLIFY_DATABASE_URL) {
    return process.env.NETLIFY_DATABASE_URL;
  }
  
  // For local development and migrations, use unpooled connection
  if (process.env.NETLIFY_DATABASE_URL_UNPOOLED) {
    return process.env.NETLIFY_DATABASE_URL_UNPOOLED;
  }

  // Fallback to DATABASE_URL if provided
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  throw new Error("No database URL found. Set NETLIFY_DATABASE_URL or DATABASE_URL.");
}

// Initialize database connection
function createDbClient() {
  const dbUrl = getDbUrl();
  console.log('Connecting to database...', { url: dbUrl.replace(/:[^:@]+@/, ':***@') });
  
  try {
    const sqlClient = neon(dbUrl);
    console.log('Database connection established');

    // Test connection
    sqlClient('SELECT 1')
      .then(() => console.log('Database connection test successful'))
      .catch(err => console.error('Database connection test failed:', err));

    return sqlClient;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

const sqlClient = createDbClient();
export const db = drizzle({ client: sqlClient, schema });
export { schema };