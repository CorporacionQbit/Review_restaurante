import { Injectable } from '@angular/core';
import { ApiService } from '../../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  constructor(private api: ApiService) {}

  getMySubscription() {
    return this.api.get('/subscriptions/my');
  }

  upgrade() {
    return this.api.patch('/subscriptions/upgrade');
  }

  downgrade() {
    return this.api.patch('/subscriptions/downgrade');
  }

  cancel(reason?: string) {
    return this.api.patch('/subscriptions/cancel', { reason });
  }
}
