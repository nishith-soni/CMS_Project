// ===========================================
// Prisma Service - Database Connection
// ===========================================
// 
// WHY THIS FILE?
// This service wraps the Prisma Client and handles:
// 1. Database connection lifecycle
// 2. Graceful shutdown (close connections when app stops)
// 3. Single instance across the entire application
//
// HOW TO USE:
// Inject this service in any other service:
// constructor(private prisma: PrismaService) {}
// Then use: this.prisma.user.findMany()

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    // Create PostgreSQL connection pool
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    // Create Prisma adapter
    const adapter = new PrismaPg(pool);
    
    // Initialize PrismaClient with adapter
    super({ adapter });
    
    this.pool = pool;
  }

  // ===========================================
  // OnModuleInit - Connect when module loads
  // ===========================================
  // WHY: Ensures database connection is ready before handling requests
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected successfully');
  }
  
  // ===========================================
  // OnModuleDestroy - Disconnect on shutdown
  // ===========================================
  // WHY: Prevents connection leaks and ensures clean shutdown
  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
    console.log('🔌 Database disconnected');
  }
}
