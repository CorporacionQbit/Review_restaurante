import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { RestaurantsService } from '../services/restaurants.service';
import { OwnerRestaurant } from '../models/restaurant-owner.model';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzCardModule,
    NzTagModule
  ],
  templateUrl: './restaurants-owner.component.html',
  styleUrls: ['./restaurants-owner.component.css'],
})
export class RestaurantsOwnerComponent implements OnInit {

  loading = true;
  restaurants: OwnerRestaurant[] = [];

  constructor(
    private restaurantsService: RestaurantsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.restaurantsService.getMyRestaurants().subscribe({
      next: (res) => {
        console.log('MIS RESTAURANTES =>', res);
        this.restaurants = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/restaurants/create']);
  }

  goToRestaurant(id: number): void {
    this.router.navigate(['/restaurants', id]);
  }
}
