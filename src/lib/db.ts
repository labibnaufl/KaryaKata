import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

// Singleton SQL client using Neon serverless
// Tagged template literals auto-parameterize queries
export const sql = neon(process.env.DATABASE_URL);
