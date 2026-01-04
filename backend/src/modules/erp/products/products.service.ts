// ===========================================
// Products Service
// ===========================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}
  
  async create(data: {
    name: string;
    sku: string;
    price: number;
    cost?: number;
    description?: string;
    stockQuantity?: number;
  }) {
    return this.prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        price: data.price,
        cost: data.cost,
        description: data.description,
        stockQuantity: data.stockQuantity || 0,
      },
    });
  }
  
  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
    lowStock?: boolean;
  }) {
    const { skip = 0, take = 10, search, lowStock } = params;
    
    const where: Prisma.ProductWhereInput = { isActive: true };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Filter products with stock below threshold
    if (lowStock) {
      where.stockQuantity = { lte: this.prisma.product.fields.lowStockThreshold };
    }
    
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);
    
    return {
      data: products,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }
  
  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    return product;
  }
  
  async update(id: string, data: Prisma.ProductUpdateInput) {
    await this.findById(id);
    
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }
  
  async updateStock(id: string, quantity: number, operation: 'add' | 'subtract' | 'set') {
    const product = await this.findById(id);
    
    let newQuantity: number;
    let quantityChange: number;
    
    switch (operation) {
      case 'add':
        newQuantity = product.stockQuantity + quantity;
        quantityChange = quantity;
        break;
      case 'subtract':
        newQuantity = Math.max(0, product.stockQuantity - quantity);
        quantityChange = -Math.min(quantity, product.stockQuantity);
        break;
      case 'set':
        newQuantity = quantity;
        quantityChange = quantity - product.stockQuantity;
        break;
    }
    
    // Update stock and log the change
    const [updatedProduct] = await this.prisma.$transaction([
      this.prisma.product.update({
        where: { id },
        data: {
          stockQuantity: newQuantity,
        },
      }),
      this.prisma.inventoryLog.create({
        data: {
          productId: id,
          quantityChange,
          reason: `Stock ${operation}: ${quantity} units`,
        },
      }),
    ]);
    
    return updatedProduct;
  }
  
  async delete(id: string) {
    await this.findById(id);
    
    // Soft delete
    await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
    
    return { message: 'Product deleted successfully' };
  }
}
