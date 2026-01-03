// ===========================================
// JWT Auth Guard - Protect Routes
// ===========================================
// 
// WHY THIS FILE?
// Guards control access to routes. This guard:
// 1. Checks if request has valid JWT token
// 2. If valid, allows request to proceed
// 3. If invalid, returns 401 Unauthorized
//
// HOW TO USE:
// @UseGuards(JwtAuthGuard)
// @Get('protected-route')
// async protectedMethod() { ... }

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
