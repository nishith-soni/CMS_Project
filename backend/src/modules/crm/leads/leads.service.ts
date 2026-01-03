// ===========================================
// Leads Service
// ===========================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LeadStatus, Prisma } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}
  
  async create(ownerId: string, data: {
    title: string;
    contactId: string;
    source?: string;
    value?: number;
  }) {
    return this.prisma.lead.create({
      data: {
        title: data.title,
        contactId: data.contactId,
        ownerId,
        source: data.source,
        value: data.value,
        status: LeadStatus.NEW,
      },
      include: {
        contact: true,
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }
  
  async findAll(params: {
    skip?: number;
    take?: number;
    status?: LeadStatus;
    ownerId?: string;
  }) {
    const { skip = 0, take = 10, status, ownerId } = params;
    
    const where: Prisma.LeadWhereInput = {};
    if (status) where.status = status;
    if (ownerId) where.ownerId = ownerId;
    
    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take,
        include: {
          contact: true,
          owner: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lead.count({ where }),
    ]);
    
    return {
      data: leads,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }
  
  async findById(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        contact: true,
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
        deal: true,
      },
    });
    
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
    
    return lead;
  }
  
  async update(id: string, data: { title?: string; status?: LeadStatus; value?: number; source?: string }) {
    await this.findById(id);
    
    return this.prisma.lead.update({
      where: { id },
      data,
      include: {
        contact: true,
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }
  
  async delete(id: string) {
    await this.findById(id);
    await this.prisma.lead.delete({ where: { id } });
    return { message: 'Lead deleted successfully' };
  }
}
