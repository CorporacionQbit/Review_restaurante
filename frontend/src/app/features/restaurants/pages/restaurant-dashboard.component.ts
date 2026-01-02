import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzProgressModule } from 'ng-zorro-antd/progress';

import { RestaurantsService } from '../../restaurants/services/restaurants.service';
import { OwnerRestaurant } from '../models/restaurant-owner.model';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NzTagModule,
    NzButtonModule,
    NzProgressModule,
  ],
  templateUrl: './restaurant-dashboard.component.html',
  styleUrls: ['./restaurant-dashboard.component.css'],
})
export class RestaurantDashboardComponent implements OnInit {

  restaurant!: OwnerRestaurant;
  loading = true;

  checklist = {
    images: false,
    schedule: false,
    socials: false,
    menu: false,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restaurantsService: RestaurantsService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.restaurantsService.getRestaurantById(id).subscribe({
      next: (res) => {
        this.restaurant = res;
        this.evaluateChecklist();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  evaluateChecklist(): void {
    this.checklist.images = (this.restaurant.images?.length || 0) > 0;
    this.checklist.menu = (this.restaurant.menus?.length || 0) > 0;
    this.checklist.socials = true; // placeholder (cuando conectes social links)
    this.checklist.schedule = true; // placeholder (cuando conectes horarios)
  }

  completionPercent(): number {
    const values = Object.values(this.checklist);
    const done = values.filter(v => v).length;
    return Math.round((done / values.length) * 100);
  }

  goPremium(): void {
    this.router.navigate(['/subscriptions', this.restaurant.restaurantId]);
  }

  goImages(): void {
    this.router.navigate(['/restaurants', this.restaurant.restaurantId, 'images']);
  }

  goMenu(): void {
    this.router.navigate(['/restaurants', this.restaurant.restaurantId, 'menu']);
  }

  sendToReview(): void {
    alert('Enviar a revisión (pendiente backend)');
  }
}
