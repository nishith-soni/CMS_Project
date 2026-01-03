// ===========================================
// Prisma Module
// ===========================================
// 
// WHY THIS FILE?
// Modules in NestJS group related functionality together.
// This module exports the PrismaService so other modules can use it.
//
// Global: true means this module is available everywhere
// without needing to import it in each feature module.

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Makes PrismaService available globally
@Module({
  providers: [PrismaService],
  exports: [PrismaService],    // Export so other modules can inject it
})
export class PrismaModule {}
