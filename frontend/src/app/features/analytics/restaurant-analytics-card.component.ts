import {
  Component,
  Input,
  OnChanges,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  ViewEncapsulation,
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
  encapsulation: ViewEncapsulation.None,
})
export class RestaurantAnalyticsCardComponent implements OnChanges {

  @Input() restaurant!: OwnerRestaurant;
  @Input() range!: '7d' | '30d' | '90d';
  @Input() groupBy: 'day' | 'month' = 'day';
  @Input() active = false;

  @ViewChild('chartCanvas')
  chartCanvas?: ElementRef<HTMLCanvasElement>;

  summary: AnalyticsSummary | null = null;
  loading = true;

  private chart?: Chart;

  constructor(
    private analyticsService: AnalyticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(): void {
    if (this.restaurant && this.active) {
      this.loadData();
    }
  }

  private loadData(): void {
    this.loading = true;

    this.analyticsService
      .getRestaurantSummary(this.restaurant.restaurantId, this.range)
      .subscribe(res => {
        this.summary = res;
        this.cdr.detectChanges();
      });

    this.analyticsService
      .getRestaurantTimeline(this.restaurant.restaurantId, this.range)
      .subscribe({
        next: rows => {
          const data =
            this.groupBy === 'month'
              ? this.groupByMonth(rows)
              : this.groupByDay(rows);

          setTimeout(() => this.renderChart(data));
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  private groupByDay(rows: any[]) {
    return rows.map(r => ({
      label: new Date(r.date).toLocaleDateString('es-GT', {
        day: '2-digit',
        month: 'short',
      }),
      views: r.views,
      clickMap: r.clickMap,
      clickWebsite: r.clickWebsite,
    }));
  }

  private groupByMonth(rows: any[]) {
    const map = new Map<string, any>();

    rows.forEach(r => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;

      if (!map.has(key)) {
        map.set(key, {
          label: d.toLocaleDateString('es-GT', {
            month: 'short',
            year: 'numeric',
          }),
          views: 0,
          clickMap: 0,
          clickWebsite: 0,
        });
      }

      const m = map.get(key);
      m.views += r.views;
      m.clickMap += r.clickMap;
      m.clickWebsite += r.clickWebsite;
    });

    return Array.from(map.values());
  }

  private renderChart(rows: any[]): void {
    if (!this.chartCanvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: rows.map(r => r.label),
        datasets: [
          {
            label: 'Vistas',
            data: rows.map(r => r.views),
            backgroundColor: '#1677ff',
          },
          {
            label: 'Mapa',
            data: rows.map(r => r.clickMap),
            backgroundColor: '#52c41a',
          },
          {
            label: 'Web',
            data: rows.map(r => r.clickWebsite),
            backgroundColor: '#faad14',
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
