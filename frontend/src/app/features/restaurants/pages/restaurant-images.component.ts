import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzMessageService } from 'ng-zorro-antd/message';

import { RestaurantsService } from '../services/restaurants.service';
import { RestaurantImage } from '../models/restaurant-image.model';

@Component({
  standalone: true,
  imports: [CommonModule, NzUploadModule],
  templateUrl: './restaurant-images.component.html',
  styleUrls: ['./restaurant-images.component.css'],
})
export class RestaurantImagesComponent implements OnInit {

  restaurantId!: number;
  images: RestaurantImage[] = [];
  isPremium = false;
  maxImages = 3;

  constructor(
    private route: ActivatedRoute,
    private service: RestaurantsService,
    private msg: NzMessageService
  ) {}

  ngOnInit(): void {
    this.restaurantId = Number(this.route.snapshot.paramMap.get('id'));

    this.service.getRestaurantById(this.restaurantId).subscribe(res => {
      this.images = res.images || [];
      this.isPremium = res.isPremium;
      this.maxImages = this.isPremium ? 10 : 3;
    });
  }
beforeUpload = (file: NzUploadFile): boolean => {

  if (this.images.length >= this.maxImages) {
    this.msg.error(`Límite alcanzado (${this.maxImages} imágenes)`);
    return false;
  }

  // ✅ USAR EL ARCHIVO DIRECTAMENTE
  const realFile = file as unknown as File;

  if (!realFile || !(realFile instanceof File)) {
    this.msg.error('Archivo inválido');
    return false;
  }

  this.service.uploadImage(this.restaurantId, realFile).subscribe({
    next: () => {
      this.msg.success('Imagen subida correctamente');
      this.ngOnInit();
    },
    error: (err) => {
      this.msg.error(err.error?.message || 'Error al subir imagen');
    }
  });

  return false;  
};
}