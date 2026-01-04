// ===========================================
// Notifications Module - In-App & System Notifications
// ===========================================
// 
// WHY: Centralized notification system for the app.
// - Stores notifications in DB for in-app display
// - Can trigger emails via MailService
// - Provides a unified API for all notification needs

import { Module, Global } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Global()
@Module({
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
