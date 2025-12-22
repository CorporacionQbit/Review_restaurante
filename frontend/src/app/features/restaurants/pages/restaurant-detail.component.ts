import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';

import { RestaurantsService } from '../services/restaurants.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzRateModule,
    NzButtonModule,
    NzInputModule,
  ],
  templateUrl: './restaurant-detail.component.html',
})
export class RestaurantDetailComponent implements OnInit {

  restaurant: any;
  reviews: any[] = [];

  rating = 5;
  reviewText = '';

  constructor(
    private route: ActivatedRoute,
    private service: RestaurantsService,
    private auth: AuthService,
    private router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.service.getRestaurantById(id).subscribe(res => {
      this.restaurant = res;
    });

    this.service.getRestaurantReviews(id).subscribe(res => {
      this.reviews = res;
    });
  }

  submitReview() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { redirect: this.router.url },
      });
      return;
    }

    this.service.createReview(this.restaurant.restaurantId, {
      rating: this.rating,
      reviewText: this.reviewText,
    }).subscribe(() => {
      this.message.success('Reseña enviada');
      this.reviewText = '';
    });
  }
}
