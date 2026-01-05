import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { RestaurantsService } from '../restaurants/services/restaurants.service';
import { OwnerRestaurant } from '../restaurants/models/restaurant-owner.model';
import { RestaurantAnalyticsCardComponent } from './restaurant-analytics-card.component';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { FormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
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
})
export class OwnerAnalyticsPage implements OnInit {

  restaurants: OwnerRestaurant[] = [];
  range: '7d' | '30d' | '90d' = '7d';

rangeOptions = [
  { label: '7 días', value: '7d' },
  { label: '30 días', value: '30d' },
  { label: '90 días', value: '90d' },
];


  constructor(private restaurantsService: RestaurantsService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.restaurantsService.getMyRestaurants().subscribe({
      next: res => this.restaurants = res,
    });
  }

changeRange(value: '7d' | '30d' | '90d'): void {
  this.range = value;
}




  activeIndex = 0;

onSlideChange(index: number): void {
  this.activeIndex = index;
}

goBack(): void {
  this.location.back();
}

  
}
