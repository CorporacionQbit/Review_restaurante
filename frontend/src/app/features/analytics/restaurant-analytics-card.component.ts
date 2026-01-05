import {
  Component,
  Input,
  OnChanges,
  ElementRef,
  ViewChild,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OwnerRestaurant } from '../restaurants/models/restaurant-owner.model';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsSummary } from './analytics-summary.model';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-restaurant-analytics-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restaurant-analytics-card.component.html',
  styleUrls: ['./restaurant-analytics-card.component.css'],
})
export class RestaurantAnalyticsCardComponent implements OnChanges {

  @Input() restaurant!: OwnerRestaurant;
  @Input() range!: '7d' | '30d' | '90d';
  @Input() active = false;

  @ViewChild('chartCanvas')
  chartCanvas?: ElementRef<HTMLCanvasElement>;

  summary: AnalyticsSummary | null = null;
  loading = true;

  private chart?: Chart;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnChanges(): void {
    if (this.restaurant && this.active) {
      this.loadData();
    }
  }

  private loadData(): void {
    this.loading = true;

    this.analyticsService
      .getRestaurantSummary(this.restaurant.restaurantId, this.range)
      .subscribe(res => (this.summary = res));

    this.analyticsService
      .getRestaurantTimeline(this.restaurant.restaurantId, this.range)
      .subscribe({
        next: rows => {
          this.renderChart(rows);
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-GT', {
      day: '2-digit',
      month: 'short',
    });
  }

  private renderChart(rows: any[]): void {
    if (!this.chartCanvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: rows.map(r => this.formatDate(r.date)),
        datasets: [
          {
            label: 'Vistas',
            data: rows.map(r => r.views),
            borderColor: '#1677ff',
            backgroundColor: 'rgba(22,119,255,0.15)',
            fill: true,
            tension: 0.35,
          },
          {
            label: 'Mapa',
            data: rows.map(r => r.clickMap),
            borderColor: '#52c41a',
            backgroundColor: 'rgba(82,196,26,0.15)',
            fill: true,
            tension: 0.35,
          },
          {
            label: 'Web',
            data: rows.map(r => r.clickWebsite),
            borderColor: '#faad14',
            backgroundColor: 'rgba(250,173,20,0.15)',
            fill: true,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
          },
        },
      },
    });
  }
}
