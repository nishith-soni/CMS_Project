// ===========================================
// CMS Module - Content Management System
// ===========================================
// 
// This module handles:
// - Posts/Articles management
// - Categories and Tags
// - Media uploads
// - SEO settings

import { Module } from '@nestjs/common';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';

@Module({
  controllers: [PostsController, CategoriesController],
  providers: [PostsService, CategoriesService],
  exports: [PostsService, CategoriesService],
})
export class CmsModule {}
