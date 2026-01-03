// ===========================================
// Categories Service
// ===========================================

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}
  
  // Create category
  async create(data: { name: string; description?: string }) {
    const slug = this.generateSlug(data.name);
    
    // Check if category with same slug exists
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }
    
    return this.prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
      },
    });
  }
  
  // Get all categories
  async findAll() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
  
  // Get category by ID
  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
    
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    return category;
  }
  
  // Update category
  async update(id: string, data: { name?: string; description?: string }) {
    await this.findById(id);
    
    const updateData: any = { ...data };
    if (data.name) {
      updateData.slug = this.generateSlug(data.name);
    }
    
    return this.prisma.category.update({
      where: { id },
      data: updateData,
    });
  }
  
  // Delete category
  async delete(id: string) {
    const category = await this.findById(id);
    
    // Check if category has posts
    if ((category as any)._count?.posts > 0) {
      throw new ConflictException('Cannot delete category with existing posts');
    }
    
    await this.prisma.category.delete({ where: { id } });
    return { message: 'Category deleted successfully' };
  }
  
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
