// ===========================================
// Roles Guard - Role-Based Access Control
// ===========================================
// 
// WHY THIS FILE?
// Beyond just "logged in", you often need role-based access.
// This guard checks if the user has the required role.
//
// HOW TO USE:
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(Role.ADMIN, Role.SUPER_ADMIN)
// @Delete(':id')
// async deleteUser() { ... }

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  
  canActivate(context: ExecutionContext): boolean {
    // Get required roles from @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // If no roles specified, allow access
    if (!requiredRoles) {
      return true;
    }
    
    // Get user from request (set by JwtStrategy)
    const { user } = context.switchToHttp().getRequest();
    
    // Check if user has any of the required roles
    return requiredRoles.some((role) => user.role === role);
  }
}
