// ===========================================
// ERP Module - Enterprise Resource Planning
// ===========================================
// 
// This module handles:
// - Products/Services catalog
// - Customers
// - Sales Orders
// - Invoices
// - Basic inventory
// - Order processing (background jobs)
// - Scheduled tasks (overdue invoices, low stock)

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { CustomersController } from './customers/customers.controller';
import { CustomersService } from './customers/customers.service';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { OrderProcessor } from './orders/order.processor';
import { InvoicesController } from './invoices/invoices.controller';
import { InvoicesService } from './invoices/invoices.service';
import { ErpScheduler } from './erp.scheduler';
import { QUEUE_NAMES } from '../shared/queue/queue.module';

@Module({
  imports: [
    // Register the order-processing queue with its processor
    BullModule.registerQueue({
      name: QUEUE_NAMES.ORDER_PROCESSING,
    }),
  ],
  controllers: [ProductsController, CustomersController, OrdersController, InvoicesController],
  providers: [
    ProductsService,
    CustomersService,
    OrdersService,
    OrderProcessor,
    InvoicesService,
    ErpScheduler,
  ],
  exports: [ProductsService, CustomersService, OrdersService, InvoicesService],
})
export class ErpModule {}
