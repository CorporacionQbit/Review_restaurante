import { Injectable } from '@angular/core';
import { ApiService } from './../../../../core/services/api.service';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  constructor(private api: ApiService) {}

  getMySubscription() {
    return this.api.get('/subscriptions/my');
  }

  upgrade(restaurantId: number) {
    return this.api.patch('/subscriptions/upgrade', {
      restaurantId,
    });
  }

  downgrade(restaurantId: number) {
    return this.api.patch('/subscriptions/downgrade', {
      restaurantId,
    });
  }

  cancel(restaurantId: number, reason?: string) {
    return this.api.patch('/subscriptions/cancel', {
      restaurantId,
      reason,
    });
  }
}
