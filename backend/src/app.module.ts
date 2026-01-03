// ===========================================
// Root Application Module
// ===========================================
// 
// WHY THIS FILE?
// This is the main module that imports all other modules.
// NestJS uses a modular architecture - each feature is a module.
//
// MODULE STRUCTURE:
// AppModule (root)
// ├── ConfigModule (environment variables)
// ├── PrismaModule (database)
// ├── AuthModule (authentication)
// ├── UsersModule (user management)
// ├── CmsModule (content management)
// ├── CrmModule (customer relationships)
// └── ErpModule (enterprise resources)

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CmsModule } from './modules/cms/cms.module';
import { CrmModule } from './modules/crm/crm.module';
import { ErpModule } from './modules/erp/erp.module';

@Module({
  imports: [
    // ===========================================
    // ConfigModule - Environment Variables
    // ===========================================
    // WHY: Loads .env file and makes variables available everywhere
    // isGlobal: true means you don't need to import it in every module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // ===========================================
    // Feature Modules
    // ===========================================
    PrismaModule,  // Database connection (must be first!)
    AuthModule,    // Authentication (JWT, login, register)
    UsersModule,   // User management
    CmsModule,     // Content Management System
    CrmModule,     // Customer Relationship Management
    ErpModule,     // Enterprise Resource Planning
  ],
})
export class AppModule {}
