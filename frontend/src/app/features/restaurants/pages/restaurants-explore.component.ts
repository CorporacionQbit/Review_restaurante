import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { RestaurantsService } from '../services/restaurants.service';

@Component({
  standalone: true,
  selector: 'app-restaurants-explore',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
  ],
  templateUrl: './restaurants-explore.component.html',
  styleUrls: ['./restaurants-explore.component.css'],
})
export class RestaurantsExploreComponent implements OnInit {
  restaurants: any[] = [];

  // 🔥 Categorías estáticas (sin controller)
  categories = [
    { id: 'rapida', name: 'Comida rápida' },
    { id: 'china', name: 'China' },
    { id: 'italiana', name: 'Italiana' },
    { id: 'mexicana', name: 'Mexicana' },
    { id: 'gourmet', name: 'Gourmet' },
  ];

  filters: any = {
    search: '',
    city: '',
    category: null,
    minRating: null,
    page: 1,
    limit: 8,
  };

  meta: any = null;

  constructor(
    private service: RestaurantsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants() {
    this.service.getRestaurants(this.filters).subscribe(res => {
      this.restaurants = res.data;
      this.meta = res.meta;
    });
  }

  clearFilters() {
    this.filters = {
      search: '',
      city: '',
      category: null,
      minRating: null,
      page: 1,
      limit: 8,
    };
    this.loadRestaurants();
  }

  nextPage() {
    if (this.meta?.hasNextPage) {
      this.filters.page++;
      this.loadRestaurants();
    }
  }

  prevPage() {
    if (this.meta?.hasPrevPage) {
      this.filters.page--;
      this.loadRestaurants();
    }
  }

  goToDetail(id: number) {
    this.router.navigate(['/restaurants', id]);
  }

  getImageUrl(r: any): string | null {
    if (r.imageUrl) {
      return `http://localhost:3000/${r.imageUrl}`;
    }
    return null;
  }

  starsArray(rating: number): number[] {
    return Array(Math.round(rating || 0)).fill(0);
  }
}
