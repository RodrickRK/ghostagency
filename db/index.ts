import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Use pooled connection by default for better performance in serverless functions
if (!process.env.NETLIFY_DATABASE_URL) {
    throw new Error('NETLIFY_DATABASE_URL must be set. Check your .env file or environment variables.');
}

const sql = neon(process.env.NETLIFY_DATABASE_URL);
export const db = drizzle({ client: sql, schema });

// Export unpooled connection for migrations and direct access
export const getUnpooledClient = () => {
    if (!process.env.NETLIFY_DATABASE_URL_UNPOOLED) {
        throw new Error('NETLIFY_DATABASE_URL_UNPOOLED must be set. Check your .env file or environment variables.');
    }
    const sql = neon(process.env.NETLIFY_DATABASE_URL_UNPOOLED);
    return drizzle({ client: sql, schema });
};