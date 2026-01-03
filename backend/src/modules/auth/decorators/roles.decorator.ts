// ===========================================
// Roles Decorator - Mark Required Roles
// ===========================================
// 
// WHY THIS FILE?
// Custom decorators let you add metadata to routes.
// This decorator marks which roles can access a route.
//
// HOW TO USE:
// @Roles(Role.ADMIN, Role.SUPER_ADMIN)
// @Get('admin-only')
// async adminOnlyRoute() { ... }

import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
