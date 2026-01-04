// ===========================================
// Invoices Service
// ===========================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { MailService } from '../../shared/mail/mail.service';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async findAll(params: {
    skip?: number;
    take?: number;
    status?: InvoiceStatus;
    customerId?: string;
  }) {
    const { skip = 0, take = 10, status, customerId } = params;

    const where: Prisma.InvoiceWhereInput = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take,
        include: {
          customer: true,
          order: {
            select: { id: true, orderNumber: true },
          },
        },
        orderBy: { issueDate: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        order: {
          include: {
            items: { include: { product: true } },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async updateStatus(id: string, status: InvoiceStatus) {
    const invoice = await this.findById(id);

    const updateData: Prisma.InvoiceUpdateInput = { status };

    // Set paidDate if marking as paid
    if (status === InvoiceStatus.PAID) {
      updateData.paidDate = new Date();
    }

    return this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        order: true,
      },
    });
  }

  async sendInvoice(id: string) {
    const invoice = await this.findById(id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot send a paid invoice');
    }

    // Send email
    const emailOptions = this.mailService.invoiceEmail({
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customer.name,
      customerEmail: invoice.customer.email,
      total: Number(invoice.total),
      dueDate: invoice.dueDate,
    });

    await this.mailService.send(emailOptions);

    // Update status to SENT if still DRAFT
    if (invoice.status === InvoiceStatus.DRAFT) {
      await this.prisma.invoice.update({
        where: { id },
        data: { status: InvoiceStatus.SENT },
      });
    }

    return { message: `Invoice ${invoice.invoiceNumber} sent to ${invoice.customer.email}` };
  }

  // Check for overdue invoices (called by cron job)
  async markOverdueInvoices() {
    const now = new Date();
    
    const result = await this.prisma.invoice.updateMany({
      where: {
        status: InvoiceStatus.SENT,
        dueDate: { lt: now },
      },
      data: { status: InvoiceStatus.OVERDUE },
    });

    return { marked: result.count };
  }

  // Get dashboard stats
  async getStats() {
    const [total, draft, sent, paid, overdue, totalRevenue] = await Promise.all([
      this.prisma.invoice.count(),
      this.prisma.invoice.count({ where: { status: InvoiceStatus.DRAFT } }),
      this.prisma.invoice.count({ where: { status: InvoiceStatus.SENT } }),
      this.prisma.invoice.count({ where: { status: InvoiceStatus.PAID } }),
      this.prisma.invoice.count({ where: { status: InvoiceStatus.OVERDUE } }),
      this.prisma.invoice.aggregate({
        where: { status: InvoiceStatus.PAID },
        _sum: { total: true },
      }),
    ]);

    return {
      total,
      draft,
      sent,
      paid,
      overdue,
      totalRevenue: Number(totalRevenue._sum.total || 0),
    };
  }
}
