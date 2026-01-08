import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRateModule } from 'ng-zorro-antd/rate';

import { ReviewsService } from './reviews.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzButtonModule,
    NzInputModule,
    NzModalModule,
    NzRateModule,
  ],
  templateUrl: './restaurant-reviews.component.html',
  styleUrls: ['./restaurant-reviews.component.css'],
})
export class RestaurantReviewsComponent implements OnInit {

  restaurantId!: number;
  reviews: any[] = [];
  loading = true;

  reportReason = '';

  @ViewChild('reportTpl', { static: true })
  reportTpl!: TemplateRef<any>;

  constructor(
    private route: ActivatedRoute,
    private reviewsService: ReviewsService,
    private modal: NzModalService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.restaurantId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.reviewsService.getRestaurantReviews(this.restaurantId).subscribe({
      next: (res) => {
        this.reviews = res;
        this.loading = false;
      },
      error: () => {
        this.message.error('No se pudieron cargar las reseñas');
        this.loading = false;
      },
    });
  }

  report(review: any): void {
    this.reportReason = '';

    this.modal.confirm({
      nzTitle: 'Reportar reseña',
      nzContent: this.reportTpl,
      nzOkText: 'Aceptar',
      nzCancelText: 'Cancelar',
      nzOnOk: () => {
        if (!this.reportReason || this.reportReason.trim().length < 5) {
          this.message.warning('Debes escribir un motivo válido');
          return false;
        }

        this.reviewsService
          .reportReview(review.reviewId, { reason: this.reportReason.trim() })
          .subscribe({
            next: () => {
              this.message.success('Reseña reportada al administrador');

              // ✅ MARCAR COMO REPORTADA SIN RECARGAR
              review.isReported = true;
            },
            error: (err) => {
              this.message.error(err.error?.message || 'Error al reportar');
            },
          });

        return true;
      },
    });
  }
}
