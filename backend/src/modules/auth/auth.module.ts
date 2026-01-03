// ===========================================
// Auth Module
// ===========================================
// 
// WHY THIS FILE?
// Groups all authentication-related functionality:
// - Login/Register controllers
// - JWT token generation
// - Password hashing
// - Guards for protected routes

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    // Import UsersModule to access user operations
    UsersModule,
    
    // Passport for authentication strategies
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // JWT Module configuration
    // WHY: Handles token signing and verification
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m';
        return {
          secret,
          signOptions: {
            expiresIn: expiresIn as any, // JWT library type issue
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
