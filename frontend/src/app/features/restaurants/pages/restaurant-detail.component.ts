import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';

import { RestaurantsService } from '../services/restaurants.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-restaurant-detail',
  imports: [
    CommonModule,
    FormsModule,
    NzRateModule,
    NzButtonModule,
    NzInputModule,
  ],
  templateUrl: './restaurant-detail.component.html',
})
export class RestaurantDetailComponent implements OnInit {

  restaurant: any;
  reviews: any[] = [];

  rating = 5;
  reviewText = '';

  safeMapUrl?: SafeResourceUrl;

  constructor(
    private route: ActivatedRoute,
    private service: RestaurantsService,
    private auth: AuthService,
    private router: Router,
    private message: NzMessageService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // =========================
    // 🔓 DATOS PÚBLICOS
    // =========================
    this.service.getRestaurantById(id).subscribe(res => {
      this.restaurant = res;

      // ✅ SANITIZAR MAPA PREMIUM
      if (res?.mapsUrl) {
        this.safeMapUrl =
          this.sanitizer.bypassSecurityTrustResourceUrl(res.mapsUrl);
      }
    });

    this.loadReviews(id);
  }

  loadReviews(id: number) {
    this.service.getRestaurantReviews(id).subscribe(res => {
      this.reviews = res;
    });
  }

  // =========================
  // 🔒 ENVIAR RESEÑA
  // =========================
  submitReview(): void {

    // ❌ NO LOGUEADO → LOGIN
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { redirect: this.router.url },
      });
      return;
    }

    // ❌ LOGUEADO PERO NO CLIENTE
    const role = this.auth.getUserRole();
    if (role !== 'client') {
      this.message.warning('Solo los clientes pueden escribir reseñas');
      return;
    }

    // ❌ VALIDACIÓN SIMPLE
    if (!this.reviewText || this.reviewText.trim().length < 3) {
      this.message.warning('Escribe un comentario válido');
      return;
    }

    // ✅ CREAR RESEÑA
    this.service.createReview(this.restaurant.restaurantId, {
      rating: this.rating,
      reviewText: this.reviewText,
    }).subscribe({
      next: () => {
        this.message.success('Reseña enviada correctamente');
        this.reviewText = '';
        this.rating = 5;
        this.loadReviews(this.restaurant.restaurantId);
      },
      error: (err) => {
        this.message.error(
          err?.error?.message || 'No se pudo enviar la reseña'
        );
      },
    });
  }

  // =========================
  // HELPERS UI
  // =========================
  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  isPremium(): boolean {
    return !!this.restaurant?.isPremium;
  }
}
