// ===========================================
// Update User DTO
// ===========================================
// 
// WHY: Defines what fields can be updated and their validation rules
// All fields are optional (Partial update)

import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;
  
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50)
  firstName?: string;
  
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50)
  lastName?: string;
  
  @IsOptional()
  @IsEnum(Role, { message: 'Invalid role' })
  role?: Role;
  
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  
  @IsOptional()
  @IsString()
  avatar?: string;
}
