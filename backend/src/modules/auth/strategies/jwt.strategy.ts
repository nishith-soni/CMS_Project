// ===========================================
// JWT Strategy - Token Validation
// ===========================================
// 
// WHY THIS FILE?
// Passport.js strategies define how authentication works.
// This strategy:
// 1. Extracts JWT from Authorization header
// 2. Validates the token signature
// 3. Returns the user if valid
//
// HOW IT'S USED:
// When you use @UseGuards(JwtAuthGuard), this strategy runs
// to validate the token and populate req.user

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

// JWT payload structure
interface JwtPayload {
  sub: string;    // User ID
  email: string;
  role: string;
  iat: number;    // Issued at
  exp: number;    // Expiration
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    super({
      // Extract token from: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // Don't ignore expired tokens
      ignoreExpiration: false,
      
      // Secret key for verification
      secretOrKey: secret,
    });
  }
  
  // ===========================================
  // Validate - Called after token is verified
  // ===========================================
  // WHY: Token might be valid but user might be deleted or deactivated
  async validate(payload: JwtPayload) {
    // Get fresh user data from database
    const user = await this.usersService.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }
    
    // This becomes req.user in controllers
    return user;
  }
}
