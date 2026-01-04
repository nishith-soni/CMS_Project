// ===========================================
// Mail Module - Email Service Configuration
// ===========================================
// 
// WHY: Centralizes email sending for the entire app.
// Uses Nodemailer under the hood. In dev, logs to console.
// In production, configure SMTP or use SendGrid/Mailgun.

import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';

@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
