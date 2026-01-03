// ===========================================
// Current User Decorator - Get User from Request
// ===========================================
// 
// WHY THIS FILE?
// Instead of accessing req.user directly, use a decorator
// for cleaner, more readable code.
//
// HOW TO USE:
// @Get('profile')
// async getProfile(@CurrentUser() user: User) {
//   return user;
// }

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
