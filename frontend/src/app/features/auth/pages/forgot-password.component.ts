import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';

import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzInputModule,
    NzButtonModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {

  loading = false;
  form!: FormGroup; // 👈 solo declaramos

  constructor(private fb: FormBuilder) {
    // ✅ inicializamos AQUÍ
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    this.loading = true;

    // 🔜 luego aquí conectas backend real
    setTimeout(() => {
      this.loading = false;
      alert('Correo enviado (demo)');
    }, 1500);
  }
}
