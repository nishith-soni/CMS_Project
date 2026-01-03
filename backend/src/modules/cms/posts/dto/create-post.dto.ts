// ===========================================
// Create Post DTO
// ===========================================

import { IsString, IsOptional, IsEnum, IsUUID, MinLength, MaxLength } from 'class-validator';
import { PostStatus } from '@prisma/client';

export class CreatePostDto {
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(200, { message: 'Title cannot exceed 200 characters' })
  title: string;
  
  @IsString()
  @MinLength(10, { message: 'Content must be at least 10 characters' })
  content: string;
  
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
  @MaxLength(70, { message: 'Meta title should be under 70 characters for SEO' })
  metaTitle?: string;
  
  @IsOptional()
  @IsString()
  @MaxLength(160, { message: 'Meta description should be under 160 characters for SEO' })
  metaDescription?: string;
}
