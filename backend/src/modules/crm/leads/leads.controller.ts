// ===========================================
// Leads Controller
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
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { LeadStatus } from '@prisma/client';
import { IsString, IsOptional, IsUUID, IsNumber, IsEnum, MinLength } from 'class-validator';

class CreateLeadDto {
  @IsString()
  @MinLength(3)
  title: string;
  
  @IsUUID()
  contactId: string;
  
  @IsOptional()
  @IsString()
  source?: string;
  
  @IsOptional()
  @IsNumber()
  value?: number;
}

class UpdateLeadDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;
  
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;
  
  @IsOptional()
  @IsString()
  source?: string;
  
  @IsOptional()
  @IsNumber()
  value?: number;
}

@Controller('crm/leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private leadsService: LeadsService) {}
  
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: LeadStatus,
  ) {
    const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || '10') : 0;
    const take = pageSize ? parseInt(pageSize) : 10;
    
    return this.leadsService.findAll({ skip, take, status });
  }
  
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.leadsService.findById(id);
  }
  
  @Post()
  async create(
    @Body() createLeadDto: CreateLeadDto,
    @CurrentUser() user: any,
  ) {
    return this.leadsService.create(user.id, createLeadDto);
  }
  
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    return this.leadsService.update(id, updateLeadDto);
  }
  
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.leadsService.delete(id);
  }
}
