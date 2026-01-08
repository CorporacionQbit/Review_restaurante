// src/admin/dashboard/admin-dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly dataSource: DataSource) {}

  async getMetrics() {
    const [
      users,
      restaurants,
      pendingRestaurants,
      pendingReviews,
    ] = await Promise.all([
      this.count('users'),
      this.count('restaurants'),
      this.count(
        'restaurants',
        `onboarding_status = 'Pendiente'`,
      ),
      this.count(
        'reviews',
        `status = 'Pendiente'`,
      ),
    ]);

    return {
      users,
      restaurants,
      pendingRestaurants,
      pendingReviews,
    };
  }

  private async count(
    table: string,
    where?: string,
  ): Promise<number> {
    const query = `
      SELECT COUNT(*)::int AS total
      FROM ${table}
      ${where ? `WHERE ${where}` : ''}
    `;

    const result = await this.dataSource.query(query);
    return result[0]?.total ?? 0;
  }
}
