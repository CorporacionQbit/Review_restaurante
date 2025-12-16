import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AuthService } from '../auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {

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
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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

    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.message.success('Cuenta creada correctamente');
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.message.error('Error al registrar');
        this.loading = false;
      },
    });
  }
}
