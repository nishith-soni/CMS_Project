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

import { Module } from '@nestjs/common';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { CustomersController } from './customers/customers.controller';
import { CustomersService } from './customers/customers.service';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';

@Module({
  controllers: [ProductsController, CustomersController, OrdersController],
  providers: [ProductsService, CustomersService, OrdersService],
  exports: [ProductsService, CustomersService, OrdersService],
})
export class ErpModule {}
