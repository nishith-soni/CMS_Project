// ===========================================
// Auth Service - Business Logic
// ===========================================
// 
// WHY THIS FILE?
// Services contain the business logic. Controllers handle HTTP,
// services handle the actual work. This separation:
// - Makes testing easier (test service without HTTP)
// - Keeps controllers thin and focused
// - Allows reuse of logic across controllers

import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// Type for JWT payload
interface JwtPayload {
  sub: string;    // Subject (user ID)
  email: string;
  role: string;
}

// Type for auth response
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  
  // ===========================================
  // Register - Create new user
  // ===========================================
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }
    
    // Hash password
    // WHY: Never store plain text passwords!
    // bcrypt automatically handles salt generation
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // Create user
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });
    
    // Generate tokens
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  }
  
  // ===========================================
  // Login - Authenticate user
  // ===========================================
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      // WHY same message: Don't reveal if email exists (security)
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Generate tokens
    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...tokens,
    };
  }
  
  // ===========================================
  // Generate Tokens - Create JWT tokens
  // ===========================================
  private async generateTokens(payload: JwtPayload) {
    // Access token - short lived (15 minutes)
    // WHY short: If stolen, limited damage
    const payloadObj = { ...payload };
    const accessToken = this.jwtService.sign(payloadObj);
    
    // Refresh token - longer lived (7 days)
    // WHY: User doesn't have to login every 15 minutes
    const refreshExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
    const refreshToken = this.jwtService.sign(payloadObj, {
      expiresIn: refreshExpiration as any,
    });
    
    return { accessToken, refreshToken };
  }
  
  // ===========================================
  // Refresh Tokens - Get new access token
  // ===========================================
  async refreshTokens(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);
      
      // Get fresh user data
      const user = await this.usersService.findById(payload.sub);
      
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
      // Generate new tokens
      return this.generateTokens({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
  
  // ===========================================
  // Validate User - Used by JWT Strategy
  // ===========================================
  async validateUser(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    
    return user;
  }
}
