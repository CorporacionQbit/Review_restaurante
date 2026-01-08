import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

export interface AdminDashboardMetrics {
  users: number;
  restaurants: number;
  pendingRestaurants: number;
  pendingReviews: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private api: ApiService) {}

  getDashboardMetrics() {
    return this.api.get<AdminDashboardMetrics>(
      '/admin/dashboard/metrics'
    );
  }
}
