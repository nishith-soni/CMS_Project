// ===========================================
// Customers Controller (ERP)
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
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IsString, IsOptional, IsEmail, IsUUID, MinLength, MaxLength } from 'class-validator';

class CreateCustomerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
  
  @IsEmail()
  email: string;
  
  @IsOptional()
  @IsString()
  phone?: string;
  
  @IsOptional()
  @IsString()
  billingAddress?: string;
  
  @IsOptional()
  @IsString()
  billingCity?: string;
  
  @IsOptional()
  @IsString()
  billingCountry?: string;
  
  @IsOptional()
  @IsUUID()
  contactId?: string;
}

class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;
  
  @IsOptional()
  @IsEmail()
  email?: string;
  
  @IsOptional()
  @IsString()
  phone?: string;
  
  @IsOptional()
  @IsString()
  billingAddress?: string;
  
  @IsOptional()
  @IsString()
  billingCity?: string;
  
  @IsOptional()
  @IsString()
  billingCountry?: string;
}

@Controller('erp/customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private customersService: CustomersService) {}
  
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
  ) {
    const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || '10') : 0;
    const take = pageSize ? parseInt(pageSize) : 10;
    
    return this.customersService.findAll({ skip, take, search });
  }
  
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.findById(id);
  }
  
  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }
  
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }
  
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.delete(id);
  }
}
