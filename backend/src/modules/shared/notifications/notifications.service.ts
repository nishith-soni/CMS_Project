// ===========================================
// Notifications Service
// ===========================================
// 
// WHY: Handles in-app notifications and system alerts.
// For now, logs to console. Later you can:
// - Store in DB (create Notification model)
// - Send via WebSocket for real-time updates
// - Integrate with MailService for email notifications

import { Injectable, Logger } from '@nestjs/common';

export type NotificationType = 
  | 'order_created'
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_delivered'
  | 'invoice_generated'
  | 'invoice_paid'
  | 'low_stock'
  | 'lead_assigned'
  | 'deal_won'
  | 'deal_lost'
  | 'system';

export interface Notification {
  type: NotificationType;
  title: string;
  message: string;
  userId?: string;      // Target user (null = broadcast)
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  
  // In-memory store for demo (replace with DB in production)
  private notifications: Notification[] = [];

  async create(notification: Omit<Notification, 'createdAt'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      createdAt: new Date(),
    };
    
    this.notifications.push(newNotification);
    
    // Log notification
    this.logger.log(`🔔 [${notification.type}] ${notification.title}: ${notification.message}`);
    
    // TODO: In production, you'd:
    // 1. Save to database
    // 2. Emit via WebSocket for real-time updates
    // 3. Optionally trigger email via MailService
    
    return newNotification;
  }

  // Get recent notifications for a user
  async getForUser(userId: string, limit = 20): Promise<Notification[]> {
    return this.notifications
      .filter(n => n.userId === userId || n.userId === undefined)
      .slice(-limit)
      .reverse();
  }

  // Get all notifications (admin)
  async getAll(limit = 50): Promise<Notification[]> {
    return this.notifications.slice(-limit).reverse();
  }

  // Helper methods for common notification types
  async orderConfirmed(orderId: string, orderNumber: string, userId?: string) {
    return this.create({
      type: 'order_confirmed',
      title: 'Order Confirmed',
      message: `Order ${orderNumber} has been confirmed and is being processed.`,
      userId,
      metadata: { orderId, orderNumber },
    });
  }

  async invoiceGenerated(invoiceId: string, invoiceNumber: string, userId?: string) {
    return this.create({
      type: 'invoice_generated',
      title: 'Invoice Generated',
      message: `Invoice ${invoiceNumber} has been generated.`,
      userId,
      metadata: { invoiceId, invoiceNumber },
    });
  }

  async lowStock(productId: string, productName: string, currentStock: number, threshold: number) {
    return this.create({
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: `${productName} is running low (${currentStock} remaining, threshold: ${threshold}).`,
      metadata: { productId, productName, currentStock, threshold },
    });
  }
}
