// src/admin/dashboard/admin-dashboard.controller.ts
import { Controller, Get, Req, ForbiddenException } from '@nestjs/common';
import type { AuthRequest } from '../auth/auth.middleware';
import { AdminDashboardService } from './admin-dashboard.service';

@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(
    private readonly service: AdminDashboardService,
  ) {}

  @Get('metrics')
  async getMetrics(@Req() req: AuthRequest) {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenException('Solo administradores');
    }

    return this.service.getMetrics();
  }
}
