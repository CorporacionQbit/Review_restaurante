import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  standalone: true,
  template: `<p>Iniciando sesión con Google...</p>`,
})
export class GoogleSuccessComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.auth.saveToken(token);

    const role = this.auth.getUserRole();

    if (role === 'admin') {
      this.router.navigate(['/admin']);
    } else if (role === 'owner') {
      this.router.navigate(['/restaurants']);
    } else {
      this.router.navigate(['/restaurants/explore']);
    }
  }
}
