// ===========================================
// Contacts Controller
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
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { IsString, IsOptional, IsEmail, MinLength, MaxLength } from 'class-validator';

class CreateContactDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;
  
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;
  
  @IsOptional()
  @IsEmail()
  email?: string;
  
  @IsOptional()
  @IsString()
  phone?: string;
  
  @IsOptional()
  @IsString()
  company?: string;
  
  @IsOptional()
  @IsString()
  jobTitle?: string;
  
  @IsOptional()
  @IsString()
  notes?: string;
}

class UpdateContactDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;
  
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;
  
  @IsOptional()
  @IsEmail()
  email?: string;
  
  @IsOptional()
  @IsString()
  phone?: string;
  
  @IsOptional()
  @IsString()
  company?: string;
  
  @IsOptional()
  @IsString()
  jobTitle?: string;
  
  @IsOptional()
  @IsString()
  notes?: string;
}

@Controller('crm/contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private contactsService: ContactsService) {}
  
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
  ) {
    const skip = page ? (parseInt(page) - 1) * parseInt(pageSize || '10') : 0;
    const take = pageSize ? parseInt(pageSize) : 10;
    
    return this.contactsService.findAll({ skip, take, search });
  }
  
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactsService.findById(id);
  }
  
  @Post()
  async create(
    @Body() createContactDto: CreateContactDto,
    @CurrentUser() user: any,
  ) {
    return this.contactsService.create(user.id, createContactDto);
  }
  
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return this.contactsService.update(id, updateContactDto);
  }
  
  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactsService.delete(id);
  }
}
