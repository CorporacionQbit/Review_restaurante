import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { FavoritesService } from '../../favorites/favorites.service';

@Component({
  standalone: true,
  selector: 'app-profile-favorites',
  imports: [CommonModule, NzCardModule, NzRateModule],
  templateUrl: './profile-favorites.component.html',
  styleUrls: ['./profile-favorites.component.css'],
})
export class ProfileFavoritesComponent implements OnInit {

  favorites: any[] = [];
  loading = true;

  constructor(
    private favoritesService: FavoritesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.favoritesService.getMyFavorites().subscribe({
      next: (res) => {
        this.favorites = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  goToRestaurant(id: number) {
    this.router.navigate(['/restaurants', id]);
  }
}
