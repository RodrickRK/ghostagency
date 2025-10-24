import { Handler } from "@netlify/functions";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "../../shared/schema";
import { seedUsers } from "../../shared/seed";

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  // Check for authorization (you might want to add better auth)
  const authHeader = event.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.SEED_AUTH_TOKEN}`) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Unauthorized" })
    };
  }

  try {
    // Initialize database connection
    const dbUrl = process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.NETLIFY_DATABASE_URL;
    if (!dbUrl) {
      throw new Error("NETLIFY_DATABASE_URL_UNPOOLED or NETLIFY_DATABASE_URL is required");
    }

    const sql = neon(dbUrl);
    const db = drizzle(sql, { schema });

    // Run the seed
    const result = await seedUsers(db);

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error("Error seeding database:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to seed database" })
    };
  }
};