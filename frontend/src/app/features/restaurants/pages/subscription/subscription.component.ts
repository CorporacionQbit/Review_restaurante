import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';

import { SubscriptionService } from '../subscription/subscription.service';

@Component({
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzCardModule],
  templateUrl: './subscription.component.html',
})
export class SubscriptionComponent implements OnInit {
  subscription: any;
  loading = true;

  constructor(
    private subscriptionService: SubscriptionService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.subscriptionService.getMySubscription().subscribe(res => {
      this.subscription = res;
      this.loading = false;
    });
  }

 upgrade() {
  this.subscriptionService.upgrade().subscribe(sub => {
    this.subscription = sub;
    this.message.success('Plan actualizado a Premium');
  });
}

downgrade() {
  this.subscriptionService.downgrade().subscribe(sub => {
    this.subscription = sub;
    this.message.success('Plan cambiado a Normal');
  });
}

}
