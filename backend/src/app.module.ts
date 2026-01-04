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
// ├── ScheduleModule (cron jobs)
// ├── EventEmitterModule (internal events)
// ├── SharedModule (queues, mail, notifications)
// ├── PrismaModule (database)
// ├── AuthModule (authentication)
// ├── UsersModule (user management)
// ├── CmsModule (content management)
// ├── CrmModule (customer relationships)
// └── ErpModule (enterprise resources)

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SharedModule } from './modules/shared/shared.module';
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
    // ScheduleModule - Cron Jobs
    // ===========================================
    // WHY: Enables @Cron() decorators for scheduled tasks
    ScheduleModule.forRoot(),
    
    // ===========================================
    // EventEmitterModule - Internal Events
    // ===========================================
    // WHY: Enables event-driven architecture within the app
    EventEmitterModule.forRoot(),
    
    // ===========================================
    // Shared Module - Queues, Mail, Notifications
    // ===========================================
    // WHY: Provides BullMQ queues, email service, and notifications
    SharedModule,
    
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
