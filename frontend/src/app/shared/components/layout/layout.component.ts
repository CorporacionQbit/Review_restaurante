import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { AuthService } from '../../../features/auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterOutlet,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzButtonModule,
  ],
  template: `
  <nz-layout style="min-height: 100vh">
    <nz-sider nzCollapsible nzWidth="220px">
      <div class="logo">Reviews</div>

      <ul nz-menu nzTheme="dark" nzMode="inline">
        <li nz-menu-item routerLink="/restaurants/explore">
          <span nz-icon nzType="search"></span>
          Explorar
        </li>

        <li *ngIf="role === 'owner'" nz-menu-item routerLink="/restaurants">
          <span nz-icon nzType="home"></span>
          Mi Restaurante
        </li>

        <li *ngIf="role === 'admin'" nz-menu-item routerLink="/admin">
          <span nz-icon nzType="tool"></span>
          Administración
        </li>
      </ul>
    </nz-sider>

    <nz-layout>
      <nz-header class="header">
        <button nz-button nzType="link" (click)="logout()">Salir</button>
      </nz-header>

      <nz-content class="content">
        <router-outlet></router-outlet>
      </nz-content>

      <nz-footer style="text-align: center">
        Reviews ©2025
      </nz-footer>
    </nz-layout>
  </nz-layout>
  `,
  styles: [`
    .logo {
      height: 32px;
      margin: 16px;
      color: #fff;
      font-size: 18px;
      text-align: center;
    }
    .header {
      background: #fff;
      padding: 0 16px;
      display: flex;
      justify-content: flex-end;
    }
    .content {
      margin: 16px;
      padding: 16px;
      background: #fff;
      min-height: 280px;
    }
  `]
})
export class LayoutComponent {

  role: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    this.role = this.auth.getUserRole();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
