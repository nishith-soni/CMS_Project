// ===========================================
// CRM Module - Customer Relationship Management
// ===========================================
// 
// This module handles:
// - Contacts management
// - Leads tracking
// - Deals/Opportunities
// - Activities (calls, meetings, tasks)

import { Module } from '@nestjs/common';
import { ContactsController } from './contacts/contacts.controller';
import { ContactsService } from './contacts/contacts.service';
import { LeadsController } from './leads/leads.controller';
import { LeadsService } from './leads/leads.service';
import { DealsController } from './deals/deals.controller';
import { DealsService } from './deals/deals.service';
import { ActivitiesController } from './activities/activities.controller';
import { ActivitiesService } from './activities/activities.service';

@Module({
  controllers: [ContactsController, LeadsController, DealsController, ActivitiesController],
  providers: [ContactsService, LeadsService, DealsService, ActivitiesService],
  exports: [ContactsService, LeadsService, DealsService, ActivitiesService],
})
export class CrmModule {}
