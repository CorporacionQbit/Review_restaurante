import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AdminReviewReportsService } from '../review/admin-review-reports.service';

@Component({
  standalone: true,
  selector: 'app-admin-review-reports',
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzTagModule,
    NzModalModule,
  ],
  templateUrl: './admin-review-reports.component.html',
  styleUrls: ['./admin-review-reports.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AdminReviewReportsComponent implements OnInit {

  loading = true;
  reports: any[] = [];

  constructor(
    private service: AdminReviewReportsService,
    private modal: NzModalService,
    private message: NzMessageService,
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports() {
    this.loading = true;
    this.service.getReports().subscribe({
      next: (data: any[]) => {
        this.reports = data.filter(r => !r.isResolved);
        this.loading = false;
      },
      error: () => {
        this.message.error('Error cargando reseñas reportadas');
        this.loading = false;
      }
    });
  }

  /* =========================
     MODAL DE MODERACIÓN
  ========================= */
 openDetailModal(report: any) {
  this.modal.confirm({
    nzTitle: 'Moderación de reseña reportada',
    nzContent: `
      <p><strong>Comentario:</strong></p>
      <p>${report.review.reviewText || 'Sin comentario'}</p>

      <p><strong>Calificación:</strong></p>
      <p>${'⭐'.repeat(report.review.rating)}</p>

      <p><strong>Motivo del reporte:</strong></p>
      <p>${report.reason}</p>

      <p style="margin-top:12px; color:#cf1322">
        ⚠ Decide si el reporte es válido
      </p>
    `,
    nzOkText: 'Eliminar reseña',
    nzOkDanger: true,
    nzOnOk: () => {
      this.deleteReview(report.review.reviewId, report.reportId);
    },
    nzCancelText: 'Ignorar reporte',
    nzOnCancel: () => {
      this.resolve(report.reportId);
    }
  });
}

deleteReview(reviewId: number, reportId: number) {
  this.service.deleteReview(reviewId).subscribe(() => {
    this.message.success('Reseña eliminada');
    this.loadReports();
  });
}

resolve(reportId: number) {
  this.service.resolveReport(reportId).subscribe(() => {
    this.message.success('Reporte ignorado');
    this.loadReports();
  });
}

  /* =========================
     ACCIONES
  ========================= */

  approve(reviewId: number) {
    this.service.approveReview(reviewId).subscribe(() => {
      this.message.success('Reseña aprobada');
      this.loadReports();
    });
  }

  reject(reviewId: number, reason: string) {
    this.service.rejectReview(reviewId, reason).subscribe(() => {
      this.message.success('Reseña rechazada');
      this.loadReports();
    });
  }
}
