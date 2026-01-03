// ===========================================
// Posts Service - Blog Post Operations
// ===========================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PostStatus, Prisma } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}
  
  // Create a new post
  async create(authorId: string, data: {
    title: string;
    content: string;
    excerpt?: string;
    categoryId?: string;
    status?: PostStatus;
    metaTitle?: string;
    metaDescription?: string;
  }) {
    // Generate slug from title
    const slug = this.generateSlug(data.title);
    
    return this.prisma.post.create({
      data: {
        ...data,
        slug,
        authorId,
        status: data.status || PostStatus.DRAFT,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
        category: true,
        tags: true,
      },
    });
  }
  
  // Get all posts with pagination and filters
  async findAll(params: {
    skip?: number;
    take?: number;
    status?: PostStatus;
    categoryId?: string;
    authorId?: string;
    search?: string;
  }) {
    const { skip = 0, take = 10, status, categoryId, authorId, search } = params;
    
    const where: Prisma.PostWhereInput = {};
    
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (authorId) where.authorId = authorId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take,
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true },
          },
          category: true,
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);
    
    return {
      data: posts,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }
  
  // Get single post by ID
  async findById(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
        category: true,
        tags: true,
      },
    });
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    
    return post;
  }
  
  // Get post by slug (for public viewing)
  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
        category: true,
        tags: true,
      },
    });
    
    if (!post) {
      throw new NotFoundException(`Post not found`);
    }
    
    return post;
  }
  
  // Update post
  async update(id: string, data: Prisma.PostUpdateInput) {
    await this.findById(id);
    
    // If title changed, regenerate slug
    if (data.title && typeof data.title === 'string') {
      data.slug = this.generateSlug(data.title);
    }
    
    return this.prisma.post.update({
      where: { id },
      data,
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
        category: true,
        tags: true,
      },
    });
  }
  
  // Publish post
  async publish(id: string) {
    await this.findById(id);
    
    return this.prisma.post.update({
      where: { id },
      data: {
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }
  
  // Delete post
  async delete(id: string) {
    await this.findById(id);
    
    await this.prisma.post.delete({
      where: { id },
    });
    
    return { message: 'Post deleted successfully' };
  }
  
  // Helper: Generate URL-friendly slug
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Date.now().toString(36);
  }
}
