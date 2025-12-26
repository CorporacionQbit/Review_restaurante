import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';

import { FavoritesService } from '../favorites.service';

@Component({
  standalone: true,
  selector: 'app-favorites',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, NzButtonModule],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorite.component.css'],
})
export class FavoritesComponent implements OnInit {

  favorites: any[] = [];
  loading = true;

  constructor(
    private favoritesService: FavoritesService,
    private router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.favoritesService.getMyFavorites().subscribe({
      next: (res) => {
        this.favorites = res;
        this.loading = false;
      },
      error: () => {
        this.message.error('No se pudieron cargar los favoritos');
        this.loading = false;
      },
    });
  }

  goToRestaurant(id: number): void {
    this.router.navigate(['/restaurants', id]);
  }

  removeFavorite(id: number): void {
    this.favoritesService.removeFavorite(id).subscribe({
      next: () => {
        this.message.success('Eliminado de favoritos');
        this.favorites = this.favorites.filter(
          (f) => f.restaurant_id !== id
        );
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/restaurants/explore']);
  }
}
