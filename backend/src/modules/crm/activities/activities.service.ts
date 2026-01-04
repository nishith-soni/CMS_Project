// ===========================================
// Activities Service - CRM Activities & Tasks
// ===========================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityType, Prisma } from '@prisma/client';

interface FindAllParams {
  skip?: number;
  take?: number;
  contactId?: string;
  dealId?: string;
}

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: FindAllParams) {
    const { skip = 0, take = 20, contactId, dealId } = params;

    const where: Prisma.ActivityWhereInput = {};
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activity.count({ where }),
    ]);

    return {
      data: activities,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findById(id: string) {
    const activity = await this.prisma.activity.findUnique({ where: { id } });
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return activity;
  }

  async create(ownerId: string, data: {
    type: ActivityType;
    title: string;
    description?: string;
    contactId?: string;
    dealId?: string;
    dueDate?: Date;
  }) {
    return this.prisma.activity.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        contactId: data.contactId,
        dealId: data.dealId,
        dueDate: data.dueDate,
        ownerId,
      },
    });
  }

  async update(id: string, data: Prisma.ActivityUpdateInput) {
    const existing = await this.findById(id);

    // Handle completed/completedAt consistency if completed flag is being changed
    let updateData: Prisma.ActivityUpdateInput = { ...data };

    if (typeof data.completed === 'boolean' || (data.completed as any)?.set !== undefined) {
      const completedValue =
        typeof data.completed === 'boolean'
          ? data.completed
          : (data.completed as any).set;

      updateData.completedAt = completedValue
        ? new Date()
        : null;
    }

    return this.prisma.activity.update({
      where: { id: existing.id },
      data: updateData,
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.activity.delete({ where: { id } });
    return { message: 'Activity deleted successfully' };
  }

  // Summary of TASK activities for dashboard (today & overdue)
  async getTaskSummaryForUser(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayTasks, overdueTasks] = await Promise.all([
      this.prisma.activity.findMany({
        where: {
          ownerId: userId,
          completed: false,
          dueDate: {
            gte: today,
            lt: tomorrow,
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
      this.prisma.activity.findMany({
        where: {
          ownerId: userId,
          completed: false,
          dueDate: {
            lt: today,
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
    ]);

    return {
      today: todayTasks,
      overdue: overdueTasks,
    };
  }
}
