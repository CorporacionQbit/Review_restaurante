import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { AuthService } from '../../../features/auth/auth.service';
import { RestaurantsService } from '../../../features/restaurants/services/restaurants.service';
import { OwnerRestaurant } from '../../../features/restaurants/models/restaurant-owner.model';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzButtonModule,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit, OnDestroy {

  role: string | null = null;
  hasRestaurants = false;
  collapsed = false;

  private breakpointSub!: Subscription;

  constructor(
    private auth: AuthService,
    private restaurantsService: RestaurantsService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private cdr: ChangeDetectorRef, // 👈 CLAVE
  ) {}

  ngOnInit(): void {
    this.role = this.auth.getUserRole();

    // ⛔ CLIENTE → NO LAYOUT
    if (this.role === 'client') {
      this.router.navigateByUrl(this.router.url.replace(/^\/+/, '/'));
      return;
    }

    // OWNER
    if (this.role === 'owner') {
      this.restaurantsService.getMyRestaurants().subscribe({
        next: (res: OwnerRestaurant[]) => {
          this.hasRestaurants = res.length > 0;
          this.cdr.detectChanges(); // 👈 estabiliza menú
        },
        error: () => {
          this.hasRestaurants = false;
          this.cdr.detectChanges(); // 👈 estabiliza menú
        },
      });
    }

    // 📱 RESPONSIVE AUTO COLLAPSE
    this.breakpointSub = this.breakpointObserver
      .observe(['(max-width: 992px)'])
      .subscribe(result => {
        this.collapsed = result.matches;
        this.cdr.detectChanges(); // 👈 evita NG0100
      });

    // 👇 asegura estado inicial consistente
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.breakpointSub?.unsubscribe();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
