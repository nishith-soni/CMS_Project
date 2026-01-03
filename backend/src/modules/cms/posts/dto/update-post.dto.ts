// ===========================================
// Update Post DTO
// ===========================================

import { IsString, IsOptional, IsEnum, IsUUID, MinLength, MaxLength } from 'class-validator';
import { PostStatus } from '@prisma/client';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;
  
  @IsOptional()
  @IsString()
  @MinLength(10)
  content?: string;
  
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;
  
  @IsOptional()
  @IsUUID()
  categoryId?: string;
  
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;
  
  @IsOptional()
  @IsString()
  @MaxLength(70)
  metaTitle?: string;
  
  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaDescription?: string;
  
  @IsOptional()
  @IsString()
  featuredImage?: string;
}
