// ===========================================
// Mail Service - Send Emails
// ===========================================
// 
// WHY: Abstraction over email sending.
// - In development: logs to console (no real emails)
// - In production: uses SMTP/SendGrid
// 
// USAGE:
//   await mailService.send({
//     to: 'customer@example.com',
//     subject: 'Order Confirmation',
//     html: '<h1>Thank you!</h1>',
//   });

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface MailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private defaultFrom: string;

  constructor(private configService: ConfigService) {
    this.defaultFrom = this.configService.get('MAIL_FROM', 'CMS App <noreply@cms.local>');
    
    // Check if we're in production with SMTP configured
    const smtpHost = this.configService.get('SMTP_HOST');
    
    if (smtpHost) {
      // Production: Real SMTP
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: this.configService.get('SMTP_PORT', 587),
        secure: this.configService.get('SMTP_SECURE', false),
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASS'),
        },
      });
      this.logger.log('Mail service configured with SMTP');
    } else {
      // Development: Just log emails (don't send)
      this.transporter = nodemailer.createTransport({
        jsonTransport: true, // Returns JSON instead of sending
      });
      this.logger.log('Mail service in DEV MODE - emails will be logged, not sent');
    }
  }

  async send(options: MailOptions): Promise<{ success: boolean; messageId?: string }> {
    const mailOptions = {
      from: options.from || this.defaultFrom,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || this.stripHtml(options.html),
      replyTo: options.replyTo,
      attachments: options.attachments,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      
      // In dev mode, log the email content
      if (!this.configService.get('SMTP_HOST')) {
        this.logger.debug('📧 Email (DEV MODE - not sent):');
        this.logger.debug(`   To: ${mailOptions.to}`);
        this.logger.debug(`   Subject: ${mailOptions.subject}`);
        this.logger.debug(`   Preview: ${options.html.substring(0, 200)}...`);
      } else {
        this.logger.log(`Email sent to ${mailOptions.to}: ${info.messageId}`);
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send email to ${mailOptions.to}:`, error);
      return { success: false };
    }
  }

  // Helper: Generate order confirmation email
  orderConfirmation(order: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: number;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): MailOptions {
    const itemsHtml = order.items
      .map(item => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>$${item.price.toFixed(2)}</td></tr>`)
      .join('');

    return {
      to: order.customerEmail,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Thank you for your order!</h1>
          <p>Hi ${order.customerName},</p>
          <p>Your order <strong>${order.orderNumber}</strong> has been confirmed.</p>
          
          <h2 style="color: #666;">Order Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: left;">Qty</th>
                <th style="padding: 10px; text-align: left;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <p style="font-size: 18px; margin-top: 20px;">
            <strong>Total: $${order.total.toFixed(2)}</strong>
          </p>
          
          <p style="color: #666; margin-top: 30px;">
            We'll notify you when your order ships.
          </p>
        </div>
      `,
    };
  }

  // Helper: Generate invoice email
  invoiceEmail(invoice: {
    invoiceNumber: string;
    customerName: string;
    customerEmail: string;
    total: number;
    dueDate: Date;
  }): MailOptions {
    return {
      to: invoice.customerEmail,
      subject: `Invoice ${invoice.invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Invoice ${invoice.invoiceNumber}</h1>
          <p>Hi ${invoice.customerName},</p>
          <p>Please find your invoice attached.</p>
          
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
            <p><strong>Amount Due:</strong> $${invoice.total.toFixed(2)}</p>
            <p><strong>Due Date:</strong> ${invoice.dueDate.toLocaleDateString()}</p>
          </div>
          
          <p style="color: #666;">
            Thank you for your business!
          </p>
        </div>
      `,
    };
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}
