import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
  restaurantId!: number;
  subscription: any;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private subscriptionService: SubscriptionService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.restaurantId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load(): void {
    this.subscriptionService.getMySubscription().subscribe(res => {
      this.subscription = res;
      this.loading = false;
    });
  }

  upgrade(): void {
    this.subscriptionService
      .upgrade(this.restaurantId)
      .subscribe(() => {
        this.message.success('Plan actualizado a Premium');
        this.load();
      });
  }

  downgrade(): void {
    this.subscriptionService
      .downgrade(this.restaurantId)
      .subscribe(() => {
        this.message.success('Plan cambiado a Normal');
        this.load();
      });
  }
}
