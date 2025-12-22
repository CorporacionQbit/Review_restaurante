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

@Component({
  standalone: true,
  selector: 'app-restaurant-detail',

  // 🔥 CLAVE PARA QUE EL CSS SE APLIQUE
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

  // =========================
  // 📌 DATA
  // =========================
  restaurant: any;
  reviews: any[] = [];

  rating = 5;
  reviewText = '';
  loading = false;

  safeMapUrl?: SafeResourceUrl;

  // =========================
  // 📌 SCROLL A RESEÑAS
  // =========================
  @ViewChild('reviewsSection')
  reviewsSection!: ElementRef<HTMLElement>;

  // =========================
  // 🖼️ GALERÍA – LIGHTBOX
  // =========================
  activeImageIndex: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private service: RestaurantsService,
    public auth: AuthService,
    public router: Router,
    private message: NzMessageService,
    private sanitizer: DomSanitizer
  ) {}

  // =========================
  // 🔄 INIT
  // =========================
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.loadRestaurant(id);
    this.loadReviews(id);
  }

  // =========================
  // 🏪 RESTAURANTE
  // =========================
  loadRestaurant(id: number): void {
    this.service.getRestaurantById(id).subscribe({
      next: (res) => {
        this.restaurant = res;

        if (res?.mapsUrl) {
          this.safeMapUrl =
            this.sanitizer.bypassSecurityTrustResourceUrl(res.mapsUrl);
        }
      },
      error: () => {
        this.message.error('No se pudo cargar el restaurante');
      },
    });
  }

  // =========================
  // ⭐ RESEÑAS
  // =========================
  loadReviews(id: number): void {
    this.service.getRestaurantReviews(id).subscribe({
      next: (res) => {
        this.reviews = res;
      },
      error: () => {
        this.message.error('No se pudieron cargar las reseñas');
      },
    });
  }

  // =========================
  // ✍️ ENVIAR RESEÑA
  // =========================
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

    if (!this.reviewText || this.reviewText.trim().length < 3) {
      this.message.warning('Escribe un comentario válido');
      return;
    }

    this.loading = true;

    this.service.createReview(this.restaurant.restaurantId, {
      rating: this.rating,
      reviewText: this.reviewText.trim(),
    }).subscribe({
      next: () => {
        this.message.success('Reseña publicada correctamente');
        this.reviewText = '';
        this.rating = 5;
        this.loadReviews(this.restaurant.restaurantId);
        this.loading = false;
      },
      error: (err) => {
        this.message.error(
          err?.error?.message || 'No se pudo enviar la reseña'
        );
        this.loading = false;
      },
    });
  }

  // =========================
  // 🔽 SCROLL SUAVE A RESEÑAS
  // =========================
  scrollToReviews(): void {
    if (this.reviewsSection) {
      this.reviewsSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  // =========================
  // 🖼️ GALERÍA – LIGHTBOX
  // =========================
  openImage(index: number): void {
    this.activeImageIndex = index;
  }

  closeImage(): void {
    this.activeImageIndex = null;
  }

  nextImage(): void {
    if (this.activeImageIndex === null) return;

    this.activeImageIndex =
      (this.activeImageIndex + 1) % this.restaurant.images.length;
  }

  prevImage(): void {
    if (this.activeImageIndex === null) return;

    this.activeImageIndex =
      (this.activeImageIndex - 1 + this.restaurant.images.length) %
      this.restaurant.images.length;
  }

  // =========================
  // 🧠 HELPERS
  // =========================
  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  isPremium(): boolean {
    return !!this.restaurant?.isPremium;
  }
}
