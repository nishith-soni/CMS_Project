// ===========================================
// Users Service - User Operations
// ===========================================
// 
// WHY THIS FILE?
// Contains all database operations for users.
// Separated from controller for testability and reusability.

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, Prisma } from '@prisma/client';

// Type for creating a user (used by AuthService)
export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  
  // ===========================================
  // Create User
  // ===========================================
  async create(data: CreateUserInput) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || Role.USER,
      },
    });
  }
  
  // ===========================================
  // Find All Users (with pagination)
  // ===========================================
  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
    role?: Role;
  }) {
    const { skip = 0, take = 10, search, role } = params;
    
    // Build where clause dynamically
    const where: Prisma.UserWhereInput = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (role) {
      where.role = role;
    }
    
    // Get users and total count
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          avatar: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    
    return {
      data: users,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }
  
  // ===========================================
  // Find User by ID
  // ===========================================
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }
  
  // ===========================================
  // Find User by Email (for auth)
  // ===========================================
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
  
  // ===========================================
  // Update User
  // ===========================================
  async update(id: string, data: Prisma.UserUpdateInput) {
    // Check if user exists
    await this.findById(id);
    
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatar: true,
        updatedAt: true,
      },
    });
  }
  
  // ===========================================
  // Delete User (soft delete by deactivating)
  // ===========================================
  async delete(id: string) {
    // Check if user exists
    await this.findById(id);
    
    // Soft delete: just deactivate
    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
    
    return { message: 'User deactivated successfully' };
  }
  
  // ===========================================
  // Hard Delete User (permanent)
  // ===========================================
  async hardDelete(id: string) {
    await this.findById(id);
    
    await this.prisma.user.delete({
      where: { id },
    });
    
    return { message: 'User deleted permanently' };
  }
}
