import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup
} from '@angular/forms';
import { Router } from '@angular/router';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';

import { finalize } from 'rxjs/operators';

import { AuthService } from '../auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  loading = false;
  form!: FormGroup;

  images: string[] = [
    'assets/comida1.png',
    'assets/comida2.png',
    'assets/comida3.png',
  ];
  currentImage = this.images[0];
  private imageIndex = 0;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private message: NzMessageService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    setInterval(() => {
      this.imageIndex = (this.imageIndex + 1) % this.images.length;
      this.currentImage = this.images[this.imageIndex];
    }, 2000);
  }

  submit(): void {
    if (this.form.invalid) return;

    this.loading = true;

    this.auth.login(this.form.value)
      .pipe(
        finalize(() => {
          this.loading = false; // ✅ NUNCA se queda cargando
        })
      )
      .subscribe({
        next: (res) => {
          this.auth.saveToken(res.accessToken);

          const role = this.auth.getUserRole();
          console.log('ROL:', role);

          if (role === 'admin') {
            this.router.navigate(['/admin']);
          } else if (role === 'owner') {
            this.router.navigate(['/restaurants']);
          } else {
            // 👈 CLIENTE
            this.router.navigate(['/restaurants/explore']);
          }
        },
        error: () => {
          this.message.error('Credenciales inválidas');
        },
      });
  }
}
