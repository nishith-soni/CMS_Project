// ===========================================
// Shared Module - Re-exports all shared services
// ===========================================
// 
// WHY: Single import for all shared functionality.
// Instead of importing QueueModule, MailModule, NotificationsModule separately,
// just import SharedModule.

import { Module } from '@nestjs/common';
import { QueueModule } from './queue/queue.module';
import { MailModule } from './mail/mail.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    QueueModule,
    MailModule,
    NotificationsModule,
  ],
  exports: [
    QueueModule,
    MailModule,
    NotificationsModule,
  ],
})
export class SharedModule {}
