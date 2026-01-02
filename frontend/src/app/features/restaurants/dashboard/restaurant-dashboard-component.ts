import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';

import { RestaurantsService } from '../services/restaurants.service';

@Component({
  standalone: true,
  selector: 'app-restaurant-dashboard',
  imports: [
    CommonModule,
    NzButtonModule,
    NzTagModule,
  ],
  templateUrl: './restaurant-dashboard.component.html',
  styleUrls: ['./restaurant-dashboard.component.css'],
})
export class RestaurantDashboardComponent implements OnInit {

  restaurantId!: number;
  restaurant: any;

  loading = true;
  progress = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restaurantsService: RestaurantsService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.restaurantId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.restaurantId) {
      this.message.error('Restaurante no válido');
      this.router.navigate(['/restaurants']);
      return;
    }

    this.loadRestaurant();
  }

  loadRestaurant(): void {
    this.loading = true;

    this.restaurantsService.getRestaurantById(this.restaurantId).subscribe({
      next: (res) => {
        this.restaurant = res;
        this.calculateProgress();
        this.loading = false;
      },
      error: () => {
        this.message.error('No se pudo cargar el restaurante');
        this.router.navigate(['/restaurants']);
      },
    });
  }

  calculateProgress(): void {
    let completed = 0;
    const total = 4;

    if (this.restaurant.images?.length) completed++;
    if (this.restaurant.schedules?.length) completed++;
    if (this.restaurant.socialLinks?.length) completed++;
    if (this.restaurant.isPremium && this.restaurant.menus?.length) completed++;

    this.progress = Math.round((completed / total) * 100);
  }

  go(section: string): void {
    this.router.navigate(['/restaurants', this.restaurantId, section]);
  }
}
