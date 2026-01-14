import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { FormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { RestaurantsService } from '../restaurants/services/restaurants.service';
import { OwnerRestaurant } from '../restaurants/models/restaurant-owner.model';
import { RestaurantAnalyticsCardComponent } from './restaurant-analytics-card.component';
import { OwnerAnalyticsSummaryComponent } from './owner-analytics-summary.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-owner-analytics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzRadioModule,
    NzCarouselModule,
    RestaurantAnalyticsCardComponent,
    OwnerAnalyticsSummaryComponent,
  ],
  templateUrl: './owner-analytics.component.html',
  styleUrls: ['./owner-analytics.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class OwnerAnalyticsPage implements OnInit {

  restaurants: OwnerRestaurant[] = [];
  range: '7d' | '30d' | '90d' = '7d';
  groupBy: 'day' | 'month' = 'day';

  activeIndex = 0;

  constructor(
    private restaurantsService: RestaurantsService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.restaurantsService.getMyRestaurants().subscribe({
      next: res => (this.restaurants = res),
    });
  }

  changeRange(value: '7d' | '30d' | '90d'): void {
    this.range = value;
  }

  onSlideChange(index: number): void {
    this.activeIndex = index;
  }

  goBack(): void {
    this.location.back();
  }
}
