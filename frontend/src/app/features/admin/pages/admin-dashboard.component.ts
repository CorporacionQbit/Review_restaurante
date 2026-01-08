import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NgxEchartsModule } from 'ngx-echarts';

import { AdminService } from '../pages/admin.service';

/* =========================
   TIPADO PRO
========================= */
interface DashboardMetrics {
  users: number;
  restaurants: number;
  pendingRestaurants: number;
  pendingReviews: number;
}

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    NzCardModule,
    NzSpinModule,
    NgxEchartsModule,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {

  loading = true;
  metrics!: DashboardMetrics;

  barOptions: any;
  donutOptions: any;

  constructor(
    private adminService: AdminService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadMetrics();
  }

  /* =========================
     CARGA MÉTRICAS
  ========================= */
  private loadMetrics(): void {
    this.adminService.getDashboardMetrics().subscribe({
      next: (res: DashboardMetrics) => {
        this.metrics = res;
        this.buildCharts();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /* =========================
     GRÁFICAS
  ========================= */
  private buildCharts(): void {

    // 📊 BARRAS — Resumen general
    this.barOptions = {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['Usuarios', 'Restaurantes'],
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Total',
          type: 'bar',
          data: [
            this.metrics.users,
            this.metrics.restaurants,
          ],
          itemStyle: {
            color: '#1677ff',
            borderRadius: [8, 8, 0, 0],
          },
        },
      ],
    };

    // 🍩 DONUT — Pendientes
    this.donutOptions = {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          avoidLabelOverlap: false,
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
            },
          },
          data: [
            {
              value: this.metrics.pendingRestaurants,
              name: 'Restaurantes pendientes',
              itemStyle: { color: '#faad14' },
            },
            {
              value: this.metrics.pendingReviews,
              name: 'Reseñas pendientes',
              itemStyle: { color: '#1677ff' },
            },
          ],
        },
      ],
    };
  }

  /* =========================
     ACCIONES RÁPIDAS (A)
  ========================= */
  goToPendingRestaurants(): void {
    this.router.navigate(['/admin/restaurants/pending']);
  }

  goToPendingReviews(): void {
    this.router.navigate(['/admin/reviews/pending']);
  }

  goToUsers(): void {
    this.router.navigate(['/admin/users']);
  }
}
  