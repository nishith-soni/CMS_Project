// ===========================================
// Users Controller - HTTP Endpoints
// ===========================================
// 
// ENDPOINTS:
// GET    /api/users         - List all users (admin only)
// GET    /api/users/:id     - Get user by ID
// PATCH  /api/users/:id     - Update user
// DELETE /api/users/:id     - Deactivate user (admin only)

import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard) // All routes require authentication
export class UsersController {
  constructor(private usersService: UsersService) {}
  
  // ===========================================
  // Get All Users - GET /api/users
  // ===========================================
  // Only admins can list all users
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('role') role?: Role,
  ) {
    const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || '10') : 0;
    const take = pageSize ? parseInt(pageSize) : 10;
    
    return this.usersService.findAll({ skip, take, search, role });
  }
  
  // ===========================================
  // Get User by ID - GET /api/users/:id
  // ===========================================
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string, // ParseUUIDPipe validates UUID format
  ) {
    return this.usersService.findById(id);
  }
  
  // ===========================================
  // Update User - PATCH /api/users/:id
  // ===========================================
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }
  
  // ===========================================
  // Delete User - DELETE /api/users/:id
  // ===========================================
  // Only admins can delete users
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.delete(id);
  }
}
