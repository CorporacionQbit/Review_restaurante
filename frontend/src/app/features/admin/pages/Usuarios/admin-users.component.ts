import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzModalService } from 'ng-zorro-antd/modal';

import { AdminUsersService } from './admin-users.service';

@Component({
  standalone: true,
  selector: 'app-admin-users',
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzTagModule,
    NzPaginationModule,
    NzInputModule,
    NzModalModule,
    NzSelectModule,
  ],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css'],
})
export class AdminUsersComponent implements OnInit {
  loading = true;

  users: any[] = [];

  page = 1;
  limit = 10;
  total = 0;

  filters = {
    search: '',
    status: null as 'active' | 'inactive' | null,
  };

  constructor(
    private service: AdminUsersService,
    private modal: NzModalService
  ) {}

  ngOnInit() {
    this.loadUsers(1);
  }

  loadUsers(page: number) {
    this.loading = true;
    this.page = page;

    this.service
      .getClients(this.page, this.limit, this.filters)
      .subscribe({
        next: (res) => {
          this.users = res.data.map((u: any) => ({
            userId: u.userId,
            fullName: u.fullName ?? '—',
            email: u.email,
            role: u.role,
            isActive: !!u.isActive,
          }));

          this.total = res.meta.total;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  resetFilters() {
    this.filters = { search: '', status: null };
    this.loadUsers(1);
  }

  toggleUser(user: any) {
    this.service.toggleUserStatus(user.userId, user.isActive).subscribe({
      next: () => {
        this.loadUsers(this.page);
      },
    });
  }

  convertToOwner(user: any): void {
    if (!user?.userId) return;

    if (!confirm(`¿Convertir a ${user.fullName} en dueño?`)) {
      return;
    }

    this.service.convertClientToOwner(user.userId).subscribe({
      next: () => {
        this.loadUsers(this.page);
      },
    });
  }
}
