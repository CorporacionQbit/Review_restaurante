import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

import { AdminOwnersService } from './admin-owners.service';

@Component({
  standalone: true,
  selector: 'app-admin-owners',
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzModalModule,
    NzTagModule,
    NzPaginationModule,
  ],
  templateUrl: './admin-owners.component.html',
  styleUrls: ['./admin-owners.component.scss'],
   encapsulation: ViewEncapsulation.None,
})
export class AdminOwnersComponent implements OnInit {
  loading = true;

  owners: any[] = [];
  page = 1;
  limit = 10;
  total = 0;

  restaurantsModalVisible = false;
  restaurantsLoading = false;
  restaurants: any[] = [];

  constructor(private service: AdminOwnersService) {}

  ngOnInit(): void {
    this.loadOwners();
  }

  loadOwners(page: number = this.page): void {
    this.loading = true;
    this.page = page;

    this.service.getOwners(this.page, this.limit).subscribe({
      next: (res) => {
        this.owners = res.data.map((o: any) => {
          const userId =
            o.userId ??
            o.userid ??
            o.user_id ??
            null;

          const isActive =
            o.isActive ??
            o.isactive ??
            o.is_active ??
            false;

          const fullName =
            o.fullName ??
            o.fullname ??
            o.full_name ??
            '—';

          return {
            userId: userId ? Number(userId) : null,
            fullName,
            email: o.email,
            isActive: Boolean(isActive),
            totalrestaurants: Number(
              o.totalRestaurants ??
              o.totalrestaurants ??
              0
            ),
            approved: Number(o.approved ?? 0),
            pending: Number(o.pending ?? 0),
            rejected: Number(o.rejected ?? 0),
          };
        });

        this.total = res.meta.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openRestaurants(owner: any): void {
    if (!owner?.userId) return;

    this.restaurants = [];
    this.restaurantsLoading = true;
    this.restaurantsModalVisible = true;

    this.service.getOwnerRestaurants(owner.userId).subscribe({
      next: (res) => {
        this.restaurants = res.map((r: any) => ({
          restaurantId: r.restaurantId,
          name: r.name,
          city: r.city ?? '—',
          zone: r.zone ?? '—',
          onboardingStatus: r.onboardingStatus ?? 'Pendiente',
        }));

        this.restaurantsLoading = false;
      },
      error: () => {
        this.restaurantsLoading = false;
      },
    });
  }

  closeRestaurantsModal(): void {
    this.restaurantsModalVisible = false;
    this.restaurants = [];
  }

  toggleOwner(owner: any): void {
    if (!owner?.userId) return;

    const confirmMsg = owner.isActive
      ? '¿Deseas DESACTIVAR esta cuenta?'
      : '¿Deseas ACTIVAR esta cuenta?';

    if (!confirm(confirmMsg)) return;

    this.service.toggleOwnerStatus(owner.userId, owner.isActive).subscribe({
      next: () => {
        owner.isActive = !owner.isActive;
      },
      error: (err) => {
        console.error('Error cambiando estado del owner', err);
        alert('No se pudo actualizar el estado del dueño');
      },
    });
  }
}
