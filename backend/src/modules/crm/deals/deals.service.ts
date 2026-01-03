// ===========================================
// Deals Service
// ===========================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DealStage, Prisma } from '@prisma/client';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}
  
  async create(ownerId: string, data: {
    title: string;
    contactId: string;
    value: number;
    leadId?: string;
    expectedCloseDate?: Date;
  }) {
    return this.prisma.deal.create({
      data: {
        title: data.title,
        contactId: data.contactId,
        ownerId,
        value: data.value,
        leadId: data.leadId,
        expectedCloseDate: data.expectedCloseDate,
        stage: DealStage.PROSPECTING,
        probability: 10,
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
    stage?: DealStage;
    ownerId?: string;
  }) {
    const { skip = 0, take = 10, stage, ownerId } = params;
    
    const where: Prisma.DealWhereInput = {};
    if (stage) where.stage = stage;
    if (ownerId) where.ownerId = ownerId;
    
    const [deals, total] = await Promise.all([
      this.prisma.deal.findMany({
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
      this.prisma.deal.count({ where }),
    ]);
    
    return {
      data: deals,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }
  
  // Get deals grouped by stage (for pipeline/kanban view)
  async getPipeline() {
    const stages = Object.values(DealStage);
    const pipeline: Record<string, any> = {};
    
    for (const stage of stages) {
      const deals = await this.prisma.deal.findMany({
        where: { stage },
        include: {
          contact: true,
          owner: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      
      const totalValue = deals.reduce((sum, deal) => sum + Number(deal.value), 0);
      
      pipeline[stage] = {
        deals,
        count: deals.length,
        totalValue,
      };
    }
    
    return pipeline;
  }
  
  async findById(id: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: {
        contact: true,
        owner: {
          select: { id: true, firstName: true, lastName: true },
        },
        lead: true,
        activities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    
    if (!deal) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }
    
    return deal;
  }
  
  async update(id: string, data: { 
    title?: string; 
    stage?: DealStage; 
    value?: number;
    probability?: number;
    expectedCloseDate?: Date;
  }) {
    await this.findById(id);
    
    return this.prisma.deal.update({
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
    await this.prisma.deal.delete({ where: { id } });
    return { message: 'Deal deleted successfully' };
  }
}
