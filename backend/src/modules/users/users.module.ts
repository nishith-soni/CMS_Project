// ===========================================
// Users Module
// ===========================================
// 
// WHY THIS FILE?
// Handles all user-related operations:
// - CRUD operations for users
// - User profile management
// - Admin user management

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export so AuthModule can use it
})
export class UsersModule {}
