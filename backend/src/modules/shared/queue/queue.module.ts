// ===========================================
// Queue Module - BullMQ Configuration
// ===========================================
// 
// WHY: Centralizes queue configuration for the entire app.
// All job queues (orders, emails, inventory, etc.) share this setup.
// BullMQ uses Redis as the backend for reliable job processing.

import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

// Queue names - export these so other modules can use them
export const QUEUE_NAMES = {
  ORDER_PROCESSING: 'order-processing',
  EMAIL: 'email',
  INVENTORY: 'inventory',
  NOTIFICATIONS: 'notifications',
} as const;

@Global() // Makes this module available everywhere without importing
@Module({
  imports: [
    // Root BullMQ configuration - connects to Redis
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
        defaultJobOptions: {
          removeOnComplete: 100,  // Keep last 100 completed jobs
          removeOnFail: 50,       // Keep last 50 failed jobs
          attempts: 3,            // Retry failed jobs 3 times
          backoff: {
            type: 'exponential',
            delay: 2000,          // Start with 2s, then 4s, 8s...
          },
        },
      }),
      inject: [ConfigService],
    }),
    
    // Register individual queues
    BullModule.registerQueue(
      { name: QUEUE_NAMES.ORDER_PROCESSING },
      { name: QUEUE_NAMES.EMAIL },
      { name: QUEUE_NAMES.INVENTORY },
      { name: QUEUE_NAMES.NOTIFICATIONS },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
