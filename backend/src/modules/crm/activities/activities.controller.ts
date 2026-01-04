// ===========================================
// Activities Controller - CRM Activities & Tasks
// ===========================================

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ActivityType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

class CreateActivityDto {
  @IsEnum(ActivityType)
  type: ActivityType;

  @IsString()
  @MinLength(2)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  contactId?: string;

  @IsOptional()
  @IsUUID()
  dealId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

class UpdateActivityDto {
  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

@Controller('crm/activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private activitiesService: ActivitiesService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('contactId') contactId?: string,
    @Query('dealId') dealId?: string,
  ) {
    const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || '20') : 0;
    const take = pageSize ? parseInt(pageSize) : 20;

    return this.activitiesService.findAll({ skip, take, contactId, dealId });
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.activitiesService.findById(id);
  }

  @Post()
  async create(
    @Body() dto: CreateActivityDto,
    @CurrentUser() user: any,
  ) {
    return this.activitiesService.create(user.id, {
      type: dto.type,
      title: dto.title,
      description: dto.description,
      contactId: dto.contactId,
      dealId: dto.dealId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActivityDto,
  ) {
    const data: any = { ...dto };
    if (dto.dueDate) {
      data.dueDate = new Date(dto.dueDate);
    }
    return this.activitiesService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.activitiesService.delete(id);
  }

  // Dashboard summary: today's and overdue TASKs for current user
  @Get('summary/tasks')
  async getTaskSummary(@CurrentUser() user: any) {
    return this.activitiesService.getTaskSummaryForUser(user.id);
  }
}
