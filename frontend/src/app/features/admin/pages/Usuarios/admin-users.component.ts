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
})
export class AdminUsersComponent implements OnInit {
  loading = true;

  users: any[] = [];
  filteredUsers: any[] = [];

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
    this.loadUsers();
  }

  loadUsers(page: number = this.page) {
    this.loading = true;
    this.page = page;

    this.service.getClients(this.page, this.limit).subscribe({
      next: (res) => {
        this.users = res.data.map((u: any) => ({
          userId: u.userId,
          fullName: u.fullName ?? '—',
          email: u.email,
          role: u.role,
          isActive: !!u.isActive,
        }));

        this.filteredUsers = [...this.users];
        this.total = res.meta.total;
        this.loading = false;

        this.applyFilters();
      },
      error: () => (this.loading = false),
    });
  }

  applyFilters() {
    let data = [...this.users];

    if (this.filters.search.trim()) {
      const term = this.filters.search.toLowerCase();
      data = data.filter(u =>
        u.fullName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    }

    if (this.filters.status === 'active') {
      data = data.filter(u => u.isActive);
    }

    if (this.filters.status === 'inactive') {
      data = data.filter(u => !u.isActive);
    }

    this.filteredUsers = data;
  }

  resetFilters() {
    this.filters = { search: '', status: null };
    this.filteredUsers = [...this.users];
  }

  toggleUser(user: any) {
    this.service.toggleUserStatus(user.userId, user.isActive).subscribe({
      next: () => {
        user.isActive = !user.isActive;
        this.applyFilters();
      },
    });
  }

  // =========================
  // CONVERTIR A DUEÑO (ADMIN)
  // =========================
 convertToOwner(user: any): void {
  if (!user?.userId) return;

  if (!confirm(`¿Convertir a ${user.fullName} en dueño?`)) {
    return;
  }

  this.service.convertClientToOwner(user.userId).subscribe({
    next: () => {
      // Quitar de la lista de clientes
      this.users = this.users.filter(u => u.userId !== user.userId);
      this.filteredUsers = this.filteredUsers.filter(u => u.userId !== user.userId);
    },
  });
}
}
