// ===========================================
// Contacts Service
// ===========================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}
  
  async create(ownerId: string, data: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    company?: string;
    jobTitle?: string;
    notes?: string;
  }) {
    return this.prisma.contact.create({
      data: {
        ...data,
        ownerId,
      },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }
  
  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
    ownerId?: string;
  }) {
    const { skip = 0, take = 10, search, ownerId } = params;
    
    const where: Prisma.ContactWhereInput = {};
    
    if (ownerId) where.ownerId = ownerId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take,
        include: {
          owner: {
            select: { id: true, firstName: true, lastName: true },
          },
          _count: {
            select: { leads: true, deals: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contact.count({ where }),
    ]);
    
    return {
      data: contacts,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }
  
  async findById(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
        leads: true,
        deals: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    
    return contact;
  }
  
  async update(id: string, data: Prisma.ContactUpdateInput) {
    await this.findById(id);
    
    return this.prisma.contact.update({
      where: { id },
      data,
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }
  
  async delete(id: string) {
    await this.findById(id);
    
    await this.prisma.contact.delete({ where: { id } });
    return { message: 'Contact deleted successfully' };
  }
}
