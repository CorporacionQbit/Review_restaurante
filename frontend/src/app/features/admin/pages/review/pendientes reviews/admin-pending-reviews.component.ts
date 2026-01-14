import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { AdminReviewReportsService } from '../admin-review-reports.service';

@Component({
  standalone: true,
  selector: 'app-admin-pending-reviews',
  templateUrl: './admin-pending-reviews.component.html',
  styleUrls: ['./admin-pending-reviews.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzSpinModule,
    NzTableModule,
    NzRateModule,
    NzButtonModule,
    NzModalModule,
    NzMessageModule,
    NzInputModule,
    NzTagModule,
    NzSelectModule,
  ],
})
export class AdminPendingReviewsComponent implements OnInit {

  loading = false;

  reviews: any[] = [];
  filteredReviews: any[] = [];

  // filtros
  searchText = '';
  minRating?: number;

  rejectReason = '';

  offensiveWords = [
    'mierda',
    'idiota',
    'basura',
    'asqueroso',
    'horrible',
  ];

  @ViewChild('rejectTpl', { static: true })
  rejectTpl!: TemplateRef<any>;

  constructor(
    private adminReviewsService: AdminReviewReportsService,
    private modal: NzModalService,
    private message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.loadPendingReviews();
  }

  loadPendingReviews(): void {
    this.loading = true;

    this.adminReviewsService.getPendingReviews().subscribe({
      next: (data) => {
        this.reviews = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.message.error('Error al cargar reseñas pendientes');
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.filteredReviews = this.reviews.filter((r) => {
      const matchesText =
        !this.searchText ||
        r.reviewText?.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesRating =
        !this.minRating || r.rating >= this.minRating;

      return matchesText && matchesRating;
    });
  }

  isOffensive(text: string): boolean {
    if (!text) return false;
    return this.offensiveWords.some((w) =>
      text.toLowerCase().includes(w),
    );
  }

  approve(reviewId: number): void {
    this.modal.confirm({
      nzTitle: '¿Aprobar reseña?',
      nzContent: 'La reseña será visible públicamente.',
      nzOkText: 'Aprobar',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.adminReviewsService.approveReview(reviewId).subscribe(() => {
          this.message.success('Reseña aprobada');
          this.loadPendingReviews();
        });
      },
    });
  }

  reject(reviewId: number): void {
    this.rejectReason = '';

    this.modal.create({
      nzTitle: 'Rechazar reseña',
      nzContent: this.rejectTpl,
      nzOkText: 'Rechazar',
      nzOkDanger: true,
      nzOnOk: () => {
        if (!this.rejectReason.trim()) {
          this.message.warning('Debes indicar un motivo');
          return false;
        }

        this.adminReviewsService
          .rejectReview(reviewId, this.rejectReason)
          .subscribe(() => {
            this.message.success('Reseña rechazada');
            this.loadPendingReviews();
          });

        return true;
      },
    });
  }
}
