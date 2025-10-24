import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load environment variables for local development
config();

if (!process.env.NETLIFY_DATABASE_URL_UNPOOLED) {
  throw new Error("NETLIFY_DATABASE_URL_UNPOOLED must be set for database migrations");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NETLIFY_DATABASE_URL_UNPOOLED,
  },
});