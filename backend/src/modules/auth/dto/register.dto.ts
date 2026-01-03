// ===========================================
// Register DTO - Validate Registration Input
// ===========================================
// 
// WHY DTOs?
// Data Transfer Objects define the shape of data and validation rules.
// Using class-validator decorators, NestJS automatically validates
// incoming requests and returns helpful error messages.

import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  // Email validation
  // - Must be valid email format
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
  
  // Password validation
  // - Minimum 8 characters
  // - At least one uppercase, one lowercase, one number
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(32, { message: 'Password cannot exceed 32 characters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]+$/,
    { message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' }
  )
  password: string;
  
  // First name
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  firstName: string;
  
  // Last name
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  lastName: string;
}
