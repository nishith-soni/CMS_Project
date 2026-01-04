// ===========================================
// Invoices Controller
// ===========================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { InvoiceStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

class UpdateStatusDto {
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;
}

@Controller('erp/invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: InvoiceStatus,
    @Query('customerId') customerId?: string,
  ) {
    const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || '10') : 0;
    const take = pageSize ? parseInt(pageSize) : 10;

    return this.invoicesService.findAll({ skip, take, status, customerId });
  }

  @Get('stats')
  async getStats() {
    return this.invoicesService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.invoicesService.findById(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.invoicesService.updateStatus(id, updateStatusDto.status);
  }

  @Post(':id/send')
  async sendInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.invoicesService.sendInvoice(id);
  }
}
