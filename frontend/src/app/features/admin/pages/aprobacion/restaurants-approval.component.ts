import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

import {
  AdminService,
  PendingRestaurant,
  RestaurantDocument,
} from '../admin.service';

@Component({
  standalone: true,
  selector: 'app-restaurants-approval',
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzModalModule,
    NzInputModule,
    NzPaginationModule,
    FormsModule,
  ],
  templateUrl: './restaurants-approval.component.html',
  styleUrls: ['./restaurants-approval.component.scss'],
})
export class RestaurantsApprovalComponent implements OnInit {

  loading = true;
  restaurants: PendingRestaurant[] = [];

  page = 1;
  limit = 10;
  total = 0;

  rejectModalVisible = false;
  rejectComment = '';
  selectedRestaurant: PendingRestaurant | null = null;

  // 🔹 DOCUMENTOS
  documentsModalVisible = false;
  documentsLoading = false;
  documents: RestaurantDocument[] = [];
  apiUrl = 'http://localhost:3000';

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.load();
  }

  load(page = this.page) {
    this.loading = true;
    this.page = page;

    this.adminService
      .getPendingRestaurants(this.page, this.limit)
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

  approve(r: PendingRestaurant) {
    this.adminService.approveRestaurant(r.restaurantId).subscribe({
      next: () => this.load(),
    });
  }

  openReject(r: PendingRestaurant) {
    this.selectedRestaurant = r;
    this.rejectComment = '';
    this.rejectModalVisible = true;
  }

  confirmReject() {
    if (!this.selectedRestaurant) return;

    this.adminService
      .rejectRestaurant(
        this.selectedRestaurant.restaurantId,
        this.rejectComment
      )
      .subscribe({
        next: () => {
          this.rejectModalVisible = false;
          this.load();
        },
      });
  }

  // =========================
  // 📄 VER DOCUMENTOS
  // =========================
  openDocuments(r: PendingRestaurant) {
    this.documentsModalVisible = true;
    this.documentsLoading = true;
    this.documents = [];

    this.adminService
      .getRestaurantDocuments(r.restaurantId)
      .subscribe({
        next: (docs) => {
          this.documents = docs;
          this.documentsLoading = false;
        },
        error: () => {
          this.documentsLoading = false;
        },
      });
  }
}
