// ===========================================
// Posts Controller - HTTP Endpoints
// ===========================================
// 
// ENDPOINTS:
// GET    /api/posts          - List all posts
// GET    /api/posts/:id      - Get post by ID
// POST   /api/posts          - Create new post
// PATCH  /api/posts/:id      - Update post
// PATCH  /api/posts/:id/publish - Publish post
// DELETE /api/posts/:id      - Delete post

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostStatus } from '@prisma/client';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}
  
  // ===========================================
  // Get All Posts - GET /api/posts
  // ===========================================
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: PostStatus,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || '10') : 0;
    const take = pageSize ? parseInt(pageSize) : 10;
    
    return this.postsService.findAll({ skip, take, status, categoryId, search });
  }
  
  // ===========================================
  // Get Post by ID - GET /api/posts/:id
  // ===========================================
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findById(id);
  }
  
  // ===========================================
  // Create Post - POST /api/posts
  // ===========================================
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: any,
  ) {
    return this.postsService.create(user.id, createPostDto);
  }
  
  // ===========================================
  // Update Post - PATCH /api/posts/:id
  // ===========================================
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }
  
  // ===========================================
  // Publish Post - PATCH /api/posts/:id/publish
  // ===========================================
  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  async publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.publish(id);
  }
  
  // ===========================================
  // Delete Post - DELETE /api/posts/:id
  // ===========================================
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.delete(id);
  }
}
