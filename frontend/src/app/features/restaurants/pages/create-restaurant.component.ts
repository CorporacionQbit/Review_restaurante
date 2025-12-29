import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';

import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';

import { RestaurantsService } from '../services/restaurants.service';

@Component({
  standalone: true,
  selector: 'app-create-restaurant',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
  ],
  templateUrl: './create-restaurant.component.html',
  styleUrls: ['./create-restaurant.component.css'],
})
export class CreateRestaurantComponent implements OnInit {

  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private restaurantsService: RestaurantsService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      phoneNumber: [''],
      email: ['', Validators.email],
      address: [''],
      city: [''],
      zone: [''],
      mapsUrl: [''],
      priceRange: [null],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.message.warning('Completa los campos obligatorios');
      return;
    }

    this.loading = true;

    this.restaurantsService.createRestaurant(this.form.value).subscribe({
      next: () => {
        this.message.success('Restaurante creado correctamente');
        this.loading = false;
      },
      error: () => {
        this.message.error('Error al crear el restaurante');
        this.loading = false;
      },
    });
  }
}
