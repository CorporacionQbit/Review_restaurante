import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';

import { RestaurantsService } from '../services/restaurants.service';
import { AuthService } from '../../auth/auth.service';
import { FavoritesService } from '../../favorites/favorites.service';

@Component({
  standalone: true,
  selector: 'app-restaurant-detail',
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    NzRateModule,
    NzButtonModule,
    NzInputModule,
    NzCardModule,
  ],
  templateUrl: './restaurant-detail.component.html',
  styleUrls: ['./restaurant-detail.component.css'],
})
export class RestaurantDetailComponent implements OnInit {

  restaurant: any;
  reviews: any[] = [];

  rating = 5;
  reviewText = '';
  loading = false;

  safeMapUrl?: SafeResourceUrl;

  isFavorite = false;
  favoriteLoading = false;

  @ViewChild('reviewsSection')
  reviewsSection!: ElementRef<HTMLElement>;

  activeImageIndex: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private service: RestaurantsService,
    private favoritesService: FavoritesService,
    public auth: AuthService,
    public router: Router,
    private message: NzMessageService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.loadRestaurant(id);
    this.loadReviews(id);
  }

  loadRestaurant(id: number): void {
    this.service.getRestaurantById(id).subscribe({
      next: (res) => {
        this.restaurant = res;

        if (res?.mapsUrl) {
          this.safeMapUrl =
            this.sanitizer.bypassSecurityTrustResourceUrl(res.mapsUrl);
        }

        this.checkIfFavorite();
      },
      error: () => {
        this.message.error('No se pudo cargar el restaurante');
      },
    });
  }

  loadReviews(id: number): void {
    this.service.getRestaurantReviews(id).subscribe({
      next: (res) => (this.reviews = res),
      error: () =>
        this.message.error('No se pudieron cargar las reseñas'),
    });
  }

  submitReview(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { redirect: this.router.url },
      });
      return;
    }

    if (this.auth.getUserRole() !== 'client') {
      this.message.warning('Solo los clientes pueden escribir reseñas');
      return;
    }

    if (!this.reviewText.trim()) {
      this.message.warning('Escribe un comentario válido');
      return;
    }

    this.loading = true;

    this.service.createReview(this.restaurant.restaurantId, {
      rating: this.rating,
      reviewText: this.reviewText.trim(),
    }).subscribe({
      next: () => {
        this.message.success('Reseña publicada');
        this.reviewText = '';
        this.rating = 5;
        this.loadReviews(this.restaurant.restaurantId);
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  scrollToReviews(): void {
    this.reviewsSection?.nativeElement.scrollIntoView({
      behavior: 'smooth',
    });
  }

  openImage(i: number) { this.activeImageIndex = i; }
  closeImage() { this.activeImageIndex = null; }
  nextImage() {
    this.activeImageIndex =
      (this.activeImageIndex! + 1) % this.restaurant.images.length;
  }
  prevImage() {
    this.activeImageIndex =
      (this.activeImageIndex! - 1 + this.restaurant.images.length) %
      this.restaurant.images.length;
  }

checkIfFavorite(): void {
  if (!this.auth.isLoggedIn()) return;

  this.favoritesService.getMyFavorites().subscribe({
    next: (favorites) => {
      this.isFavorite = favorites.some(
        f => f.restaurant_id === this.restaurant.restaurantId
      );
    },
  });
}


 toggleFavorite(): void {
  if (!this.auth.isLoggedIn()) {
    this.router.navigate(['/auth/login'], {
      queryParams: { redirect: this.router.url },
    });
    return;
  }

  this.favoriteLoading = true;

  const action$ = this.isFavorite
    ? this.favoritesService.removeFavorite(this.restaurant.restaurantId)
    : this.favoritesService.addFavorite(this.restaurant.restaurantId);

  action$.subscribe({
    next: () => {
      this.isFavorite = !this.isFavorite;
      this.favoriteLoading = false;
    },
    error: () => {
      this.favoriteLoading = false;
    },
  });
}


  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }
}
