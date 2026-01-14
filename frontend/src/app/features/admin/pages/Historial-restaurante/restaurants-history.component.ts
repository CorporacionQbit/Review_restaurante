import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { AdminService } from '../admin.service';

@Component({
  standalone: true,
  selector: 'app-restaurants-history',
  imports: [
    CommonModule,
    NzTableModule,
    NzPaginationModule,
    NzTagModule,
  ],
  templateUrl: './restaurants-history.component.html',
  styleUrls: ['./restaurants-history.component.scss'],
})
export class RestaurantsHistoryComponent implements OnInit {
  loading = true;
  restaurants: any[] = [];

  page = 1;
  limit = 10;
  total = 0;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.load();
  }

  load(page = this.page) {
    this.loading = true;
    this.page = page;

    this.adminService
      .getRestaurantsHistory(this.page, this.limit)
      .subscribe({
        next: (res) => {
          this.restaurants = res.data;
          this.total = res.meta.total;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }
}
