// ===========================================
// Deals Controller
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
import { DealsService } from './deals.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { DealStage } from '@prisma/client';
import { IsString, IsOptional, IsUUID, IsNumber, IsEnum, IsDateString, MinLength } from 'class-validator';

class CreateDealDto {
  @IsString()
  @MinLength(3)
  title: string;
  
  @IsUUID()
  contactId: string;
  
  @IsNumber()
  value: number;
  
  @IsOptional()
  @IsUUID()
  leadId?: string;
  
  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;
}

class UpdateDealDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;
  
  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;
  
  @IsOptional()
  @IsNumber()
  value?: number;
  
  @IsOptional()
  @IsNumber()
  probability?: number;
  
  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;
}

@Controller('crm/deals')
@UseGuards(JwtAuthGuard)
export class DealsController {
  constructor(private dealsService: DealsService) {}
  
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('stage') stage?: DealStage,
  ) {
    const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || '10') : 0;
    const take = pageSize ? parseInt(pageSize) : 10;
    
    return this.dealsService.findAll({ skip, take, stage });
  }
  
  // Pipeline view (kanban)
  @Get('pipeline')
  async getPipeline() {
    return this.dealsService.getPipeline();
  }
  
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.dealsService.findById(id);
  }
  
  @Post()
  async create(
    @Body() createDealDto: CreateDealDto,
    @CurrentUser() user: any,
  ) {
    return this.dealsService.create(user.id, {
      ...createDealDto,
      expectedCloseDate: createDealDto.expectedCloseDate 
        ? new Date(createDealDto.expectedCloseDate) 
        : undefined,
    });
  }
  
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDealDto: UpdateDealDto,
  ) {
    return this.dealsService.update(id, {
      ...updateDealDto,
      expectedCloseDate: updateDealDto.expectedCloseDate 
        ? new Date(updateDealDto.expectedCloseDate) 
        : undefined,
    });
  }
  
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.dealsService.delete(id);
  }
}
