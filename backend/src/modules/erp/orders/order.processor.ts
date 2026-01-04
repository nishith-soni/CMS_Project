// ===========================================
// Order Processor - Background Job Worker
// ===========================================
// 
// WHY: Handles order processing asynchronously.
// When an order is confirmed, this processor:
// 1. Validates stock availability
// 2. Deducts inventory
// 3. Creates inventory logs
// 4. Generates an invoice
// 5. Sends confirmation email to customer
// 6. Creates system notifications
//
// BENEFITS:
// - Order API returns immediately (fast response)
// - Heavy work happens in background
// - Automatic retries on failure
// - Can scale workers independently

import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../shared/mail/mail.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { QUEUE_NAMES } from '../../shared/queue/queue.module';
import { OrderStatus, InvoiceStatus } from '@prisma/client';

// Job payload type
export interface ProcessOrderJob {
  orderId: string;
  userId: string;
}

@Processor(QUEUE_NAMES.ORDER_PROCESSING)
export class OrderProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private notificationsService: NotificationsService,
  ) {
    super();
    this.logger.log('🚀 OrderProcessor worker initialized and listening for jobs');
  }

  async process(job: Job<ProcessOrderJob>): Promise<{ success: boolean; invoiceId?: string }> {
    const { orderId, userId } = job.data;
    this.logger.log(`Processing order ${orderId}...`);

    try {
      // Step 1: Get order with items and customer
      const order = await this.prisma.salesOrder.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { product: true } },
          customer: true,
          user: true,
        },
      });

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      if (order.status !== OrderStatus.CONFIRMED) {
        this.logger.warn(`Order ${orderId} is not in CONFIRMED status, skipping`);
        return { success: false };
      }

      // Step 2: Validate stock availability
      await job.updateProgress(10);
      for (const item of order.items) {
        if (item.product.stockQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for ${item.product.name}: need ${item.quantity}, have ${item.product.stockQuantity}`
          );
        }
      }

      // Step 3: Deduct inventory and create logs (in a transaction)
      await job.updateProgress(30);
      await this.prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          // Deduct stock
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } },
          });

          // Create inventory log
          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              quantityChange: -item.quantity,
              reason: 'Sale',
              reference: order.orderNumber,
            },
          });

          // Check if stock is now low
          const updatedProduct = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (updatedProduct && updatedProduct.stockQuantity <= updatedProduct.lowStockThreshold) {
            // Queue low stock notification
            await this.notificationsService.lowStock(
              item.productId,
              item.product.name,
              updatedProduct.stockQuantity,
              updatedProduct.lowStockThreshold,
            );
          }
        }

        // Update order status to PROCESSING
        await tx.salesOrder.update({
          where: { id: orderId },
          data: { status: OrderStatus.PROCESSING },
        });
      });

      // Step 4: Generate invoice
      await job.updateProgress(60);
      const invoiceCount = await this.prisma.invoice.count();
      const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`;
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days

      const invoice = await this.prisma.invoice.create({
        data: {
          invoiceNumber,
          customerId: order.customerId,
          orderId: order.id,
          subtotal: order.subtotal,
          taxAmount: order.taxAmount,
          discount: order.discount,
          total: order.total,
          status: InvoiceStatus.SENT,
          dueDate,
        },
      });

      this.logger.log(`Invoice ${invoiceNumber} created for order ${order.orderNumber}`);

      // Step 5: Send confirmation email
      await job.updateProgress(80);
      const emailOptions = this.mailService.orderConfirmation({
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        customerEmail: order.customer.email,
        total: Number(order.total),
        items: order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: Number(item.unitPrice),
        })),
      });
      await this.mailService.send(emailOptions);

      // Step 6: Create notifications
      await job.updateProgress(90);
      await this.notificationsService.orderConfirmed(orderId, order.orderNumber, userId);
      await this.notificationsService.invoiceGenerated(invoice.id, invoiceNumber, userId);

      // Step 7: Update order status to SHIPPED (processing complete)
      await this.prisma.salesOrder.update({
        where: { id: orderId },
        data: { status: OrderStatus.SHIPPED },
      });

      await job.updateProgress(100);
      this.logger.log(`✅ Order ${order.orderNumber} processed successfully`);

      return { success: true, invoiceId: invoice.id };
    } catch (error) {
      this.logger.error(`❌ Failed to process order ${orderId}:`, error);
      throw error; // BullMQ will retry based on config
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<ProcessOrderJob>) {
    this.logger.log(`Job ${job.id} completed for order ${job.data.orderId}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<ProcessOrderJob>, error: Error) {
    this.logger.error(`Job ${job.id} failed for order ${job.data.orderId}: ${error.message}`);
  }
}
