// ===========================================
// Prisma Configuration File (Prisma v7+)
// ===========================================
// WHY: Prisma v7 moved database URLs to a config file for better security
// This file handles database connections for migrations

import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Load environment variables from .env file
import { config } from 'dotenv';
config();

export default defineConfig({
  // Early access features
  earlyAccess: true,
  
  // Schema file location
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  
  // Database connection for migrations
  migrate: {
    async adapter() {
      // Dynamic import for the pg adapter
      const { PrismaPg } = await import('@prisma/adapter-pg');
      const { Pool } = await import('pg');
      
      // Create connection pool
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      
      return new PrismaPg(pool);
    },
  },

  // Seed command configuration
  migrations: {
    seed: 'npx ts-node prisma/seed.ts',
  },

  // Datasource URL for migrations
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
