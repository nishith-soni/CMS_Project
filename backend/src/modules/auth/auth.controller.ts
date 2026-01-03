// ===========================================
// Auth Controller - HTTP Endpoints
// ===========================================
// 
// WHY THIS FILE?
// Controllers handle HTTP requests and responses.
// They receive requests, call services, and return responses.
//
// ENDPOINTS:
// POST /api/auth/register - Create new account
// POST /api/auth/login    - Login and get tokens
// POST /api/auth/refresh  - Refresh access token
// GET  /api/auth/me       - Get current user (protected)

import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  
  // ===========================================
  // Register - POST /api/auth/register
  // ===========================================
  // Creates a new user account
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  
  // ===========================================
  // Login - POST /api/auth/login
  // ===========================================
  // Authenticates user and returns tokens
  @Post('login')
  @HttpCode(HttpStatus.OK) // Return 200 instead of 201
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  
  // ===========================================
  // Refresh Token - POST /api/auth/refresh
  // ===========================================
  // Gets new access token using refresh token
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }
  
  // ===========================================
  // Get Current User - GET /api/auth/me
  // ===========================================
  // Returns the currently authenticated user
  // Protected route - requires valid JWT
  @Get('me')
  @UseGuards(JwtAuthGuard) // This guard checks the JWT token
  async getMe(@Request() req: any) {
    // req.user is set by JwtStrategy after validating token
    return {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      avatar: req.user.avatar,
    };
  }
}
