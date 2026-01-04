// ===========================================
// Sales Orders Service
// ===========================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus, Prisma } from '@prisma/client';
import { QUEUE_NAMES } from '../../shared/queue/queue.module';
import { ProcessOrderJob } from './order.processor';

interface OrderItem {
  productId: string;
  quantity: number;
  discount?: number;
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.ORDER_PROCESSING) private orderQueue: Queue<ProcessOrderJob>,
  ) {}
  
  async create(userId: string, data: {
    customerId: string;
    items: OrderItem[];
    taxRate?: number;
    discount?: number;
    notes?: string;
  }) {
    // Get products for the order
    const productIds = data.items.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    
    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }
    
    // Create product lookup
    const productMap = new Map(products.map(p => [p.id, p]));
    
    // Calculate totals
    let subtotal = 0;
    const orderItems = data.items.map(item => {
      const product = productMap.get(item.productId)!;
      const itemTotal = Number(product.price) * item.quantity - (item.discount || 0);
      subtotal += itemTotal;
      
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        discount: item.discount || 0,
        total: itemTotal,
      };
    });
    
    const taxRate = data.taxRate || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const orderDiscount = data.discount || 0;
    const total = subtotal + taxAmount - orderDiscount;
    
    // Generate order number
    const orderCount = await this.prisma.salesOrder.count();
    const orderNumber = `SO-${String(orderCount + 1).padStart(6, '0')}`;
    
    // Create order with items
    return this.prisma.salesOrder.create({
      data: {
        orderNumber,
        customerId: data.customerId,
        userId,
        subtotal,
        taxRate,
        taxAmount,
        discount: orderDiscount,
        total,
        notes: data.notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        customer: true,
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
        items: {
          include: { product: true },
        },
      },
    });
  }
  
  async findAll(params: {
    skip?: number;
    take?: number;
    status?: OrderStatus;
    customerId?: string;
  }) {
    const { skip = 0, take = 10, status, customerId } = params;
    
    const where: Prisma.SalesOrderWhereInput = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    
    const [orders, total] = await Promise.all([
      this.prisma.salesOrder.findMany({
        where,
        skip,
        take,
        include: {
          customer: true,
          user: {
            select: { id: true, firstName: true, lastName: true },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy: { orderDate: 'desc' },
      }),
      this.prisma.salesOrder.count({ where }),
    ]);
    
    return {
      data: orders,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }
  
  async findById(id: string) {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
        items: {
          include: { product: true },
        },
        invoice: true,
      },
    });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
    return order;
  }
  
  async updateStatus(id: string, status: OrderStatus) {
    await this.findById(id);
    
    return this.prisma.salesOrder.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
    });
  }
  
  // Confirm order and queue for processing
  async confirmOrder(id: string, userId: string) {
    const order = await this.findById(id);
    
    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Can only confirm draft orders');
    }
    
    // Update status to CONFIRMED
    const confirmedOrder = await this.prisma.salesOrder.update({
      where: { id },
      data: { status: OrderStatus.CONFIRMED },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });
    
    // Queue for background processing
    const job = await this.orderQueue.add(
      'process-order',
      { orderId: id, userId },
      {
        jobId: `order-${id}`,
        priority: 1, // High priority
      },
    );
    
    return {
      ...confirmedOrder,
      jobId: job.id,
      message: 'Order confirmed and queued for processing',
    };
  }
  
  // Get order processing status (job status)
  async getProcessingStatus(id: string) {
    const order = await this.findById(id);
    
    // Try to get the job from the queue
    const job = await this.orderQueue.getJob(`order-${id}`);
    
    let processingStatus = 'not_started';
    let progress = 0;
    
    if (job) {
      const state = await job.getState();
      processingStatus = state;
      progress = job.progress as number || 0;
    }
    
    return {
      orderId: id,
      orderStatus: order.status,
      processingStatus,
      progress,
    };
  }
  
  async delete(id: string) {
    const order = await this.findById(id);
    
    if (order.status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft orders');
    }
    
    await this.prisma.salesOrder.delete({ where: { id } });
    return { message: 'Order deleted successfully' };
  }
}
