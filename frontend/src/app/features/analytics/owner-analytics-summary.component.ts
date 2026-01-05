import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from './services/analytics.service';

@Component({
  selector: 'app-owner-analytics-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './owner-analytics-summary.component.html',
  styleUrls: ['./owner-analytics-summary.component.css'],
})
export class OwnerAnalyticsSummaryComponent implements OnChanges {

  @Input() range!: '7d' | '30d' | '90d';

  loading = false;
  data: any = null;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnChanges(): void {
    if (!this.range) return;

    this.loading = true;

    this.analyticsService.getOwnerSummary(this.range).subscribe({
      next: res => {
        this.data = res;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
