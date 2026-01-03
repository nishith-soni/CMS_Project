// ===========================================
// Customers Service (ERP)
// ===========================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}
  
  async create(data: {
    name: string;
    email: string;
    phone?: string;
    billingAddress?: string;
    billingCity?: string;
    billingCountry?: string;
    contactId?: string;
  }) {
    return this.prisma.customer.create({
      data,
    });
  }
  
  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
  }) {
    const { skip = 0, take = 10, search } = params;
    
    const where: Prisma.CustomerWhereInput = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: { salesOrders: true, invoices: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.customer.count({ where }),
    ]);
    
    return {
      data: customers,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }
  
  async findById(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        salesOrders: {
          orderBy: { orderDate: 'desc' },
          take: 10,
        },
        invoices: {
          orderBy: { issueDate: 'desc' },
          take: 10,
        },
        contact: true,
      },
    });
    
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    
    return customer;
  }
  
  async update(id: string, data: Prisma.CustomerUpdateInput) {
    await this.findById(id);
    
    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }
  
  async delete(id: string) {
    await this.findById(id);
    await this.prisma.customer.delete({ where: { id } });
    return { message: 'Customer deleted successfully' };
  }
}
