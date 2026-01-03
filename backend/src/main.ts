// ===========================================
// Main Entry Point - NestJS Application
// ===========================================
// 
// WHY THIS FILE?
// This is where your NestJS application starts. It:
// 1. Creates the NestJS application instance
// 2. Configures global middleware (CORS, validation, etc.)
// 3. Starts listening for HTTP requests
//
// PRODUCTION CONSIDERATIONS:
// - Helmet for security headers
// - Rate limiting to prevent abuse
// - Compression for faster responses
// - Proper CORS configuration

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create the NestJS application
  // WHY: NestFactory creates an instance of your app with all modules loaded
  const app = await NestFactory.create(AppModule);
  
  // ===========================================
  // Global Prefix - All routes start with /api
  // ===========================================
  // WHY: Separates API routes from potential frontend routes
  // Example: /api/users, /api/posts, /api/auth/login
  app.setGlobalPrefix('api');
  
  // ===========================================
  // CORS Configuration
  // ===========================================
  // WHY: Allows your React frontend to make requests to this API
  // Without CORS, browsers block cross-origin requests for security
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true, // Allow cookies for authentication
  });
  
  // ===========================================
  // Global Validation Pipe
  // ===========================================
  // WHY: Automatically validates incoming request data
  // Uses class-validator decorators in your DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip unknown properties
      forbidNonWhitelisted: true,// Throw error if unknown properties sent
      transform: true,           // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert types (string "1" to number 1)
      },
    }),
  );
  
  // ===========================================
  // Start the Server
  // ===========================================
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
}

// Start the application
bootstrap();
