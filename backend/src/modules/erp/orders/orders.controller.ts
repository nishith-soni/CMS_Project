// ===========================================
// Sales Orders Controller
// ===========================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrderStatus } from '@prisma/client';
import { 
  IsString, IsOptional, IsUUID, IsNumber, IsArray, 
  ValidateNested, IsEnum, Min, ArrayMinSize 
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsUUID()
  productId: string;
  
  @IsNumber()
  @Min(1)
  quantity: number;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

class CreateOrderDto {
  @IsUUID()
  customerId: string;
  
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
  
  @IsOptional()
  @IsString()
  notes?: string;
}

class UpdateStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

@Controller('erp/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}
  
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: OrderStatus,
    @Query('customerId') customerId?: string,
  ) {
    const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || '10') : 0;
    const take = pageSize ? parseInt(pageSize) : 10;
    
    return this.ordersService.findAll({ skip, take, status, customerId });
  }
  
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findById(id);
  }
  
  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.create(user.id, createOrderDto);
  }
  
  @Post(':id/confirm')
  async confirmOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.confirmOrder(id, user.id);
  }
  
  @Get(':id/processing-status')
  async getProcessingStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.getProcessingStatus(id);
  }
  
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateStatusDto.status);
  }
  
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.delete(id);
  }
}
