import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { Router } from '@angular/router';

import { ProfileService } from '../service/profile.service';
import { FavoritesService } from '../../favorites/favorites.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [
    CommonModule,
    NzRateModule,
    FormsModule,
    NzCardModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {

  user: any;
  reviews: any[] = [];
  favorites: any[] = [];

  loading = true;
  favoritesLoading = true;

  editingReviewId: number | null = null;
  editRating = 5;
  editText = '';

  constructor(
    private profileService: ProfileService,
    private favoritesService: FavoritesService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadMyReviews();
    this.loadFavorites();
  }

  // =========================
  // 👤 PERFIL
  // =========================
  loadProfile(): void {
    this.profileService.getMyProfile().subscribe(res => {
      this.user = res;
    });
  }

  // =========================
  // ⭐ RESEÑAS
  // =========================
  loadMyReviews(): void {
    this.profileService.getMyReviews().subscribe(res => {
      this.reviews = res;
      this.loading = false;
    });
  }

  get averageRating(): number {
    if (!this.reviews.length) return 0;
    const total = this.reviews.reduce((s, r) => s + r.rating, 0);
    return +(total / this.reviews.length).toFixed(1);
  }

  startEdit(review: any) {
    this.editingReviewId = review.reviewId;
    this.editRating = review.rating;
    this.editText = review.reviewText;
  }

  saveEdit(reviewId: number) {
    this.profileService.updateReview(reviewId, {
      rating: this.editRating,
      reviewText: this.editText,
    }).subscribe(() => {
      this.editingReviewId = null;
      this.loadMyReviews();
    });
  }

  cancelEdit() {
    this.editingReviewId = null;
  }

  deleteReview(reviewId: number) {
    if (!confirm('¿Seguro que deseas eliminar esta reseña?')) return;

    this.profileService.deleteReview(reviewId).subscribe(() => {
      this.loadMyReviews();
    });
  }

  // =========================
  // ❤️ FAVORITOS
  // =========================
  loadFavorites(): void {
    this.favoritesService.getMyFavorites().subscribe({
      next: (res) => {
        this.favorites = res;
        this.favoritesLoading = false;
      },
      error: () => {
        this.favoritesLoading = false;
      },
    });
  }

  // =========================
  // 🧭 NAVEGACIÓN
  // =========================
  goToRestaurant(restaurantId: number): void {
    this.router.navigate(['/restaurants', restaurantId]);
  }

  goBack(): void {
    this.router.navigate(['/restaurants/explore']);
  }
}
