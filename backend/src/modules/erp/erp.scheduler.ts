// ===========================================
// ERP Scheduler - Scheduled Tasks for ERP Module
// ===========================================
// 
// WHY: Automates routine tasks that need to run on a schedule.
// Uses @nestjs/schedule for cron-based execution.

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InvoicesService } from './invoices/invoices.service';
import { NotificationsService } from '../shared/notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ErpScheduler {
  private readonly logger = new Logger(ErpScheduler.name);

  constructor(
    private invoicesService: InvoicesService,
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {}

  // Run every day at midnight - mark overdue invoices
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleOverdueInvoices() {
    this.logger.log('Running overdue invoice check...');
    
    try {
      const result = await this.invoicesService.markOverdueInvoices();
      
      if (result.marked > 0) {
        this.logger.log(`Marked ${result.marked} invoices as overdue`);
        await this.notificationsService.create({
          type: 'system',
          title: 'Overdue Invoices',
          message: `${result.marked} invoice(s) have been marked as overdue.`,
        });
      }
    } catch (error) {
      this.logger.error('Failed to check overdue invoices:', error);
    }
  }

  // Run every day at 9am - check for low stock
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleLowStockCheck() {
    this.logger.log('Running low stock check...');
    
    try {
      const lowStockProducts = await this.prisma.product.findMany({
        where: {
          isActive: true,
          stockQuantity: { lte: this.prisma.product.fields.lowStockThreshold },
        },
      });

      // Use raw query to compare columns
      const products = await this.prisma.$queryRaw<Array<{
        id: string;
        name: string;
        stockQuantity: number;
        lowStockThreshold: number;
      }>>`
        SELECT id, name, stock_quantity as "stockQuantity", low_stock_threshold as "lowStockThreshold"
        FROM products
        WHERE is_active = true AND stock_quantity <= low_stock_threshold
      `;

      for (const product of products) {
        await this.notificationsService.lowStock(
          product.id,
          product.name,
          product.stockQuantity,
          product.lowStockThreshold,
        );
      }

      if (products.length > 0) {
        this.logger.log(`Found ${products.length} products with low stock`);
      }
    } catch (error) {
      this.logger.error('Failed to check low stock:', error);
    }
  }
}
