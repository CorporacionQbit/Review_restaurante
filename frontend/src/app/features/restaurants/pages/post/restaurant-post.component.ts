import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';

import { RestaurantsService } from '../../services/restaurants.service';
import { OwnerRestaurant, RestaurantPost } from '../../models/restaurant-owner.model';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzCardModule,
    NzSwitchModule,
  ],
  templateUrl: './restaurant-post.component.html',
  styleUrls: ['./restaurant-post.component.css'],
})
export class RestaurantPostsComponent implements OnInit {

  restaurantId!: number;
  restaurant!: OwnerRestaurant;

  posts: RestaurantPost[] = [];

  title = '';
  content = '';
  imageUrl = '';

  loading = true;
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private restaurantsService: RestaurantsService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.restaurantId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRestaurant();
    this.loadPosts();
  }

  loadRestaurant(): void {
    this.restaurantsService.getRestaurantById(this.restaurantId).subscribe({
      next: (res) => {
        this.restaurant = res;
      }
    });
  }

  loadPosts(): void {
    this.restaurantsService.getPostsByRestaurant(this.restaurantId).subscribe({
      next: (res) => {
        this.posts = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

 createPost(): void {
  if (!this.title || !this.content) {
    this.message.warning('Título y contenido son obligatorios');
    return;
  }

  this.saving = true;

  this.restaurantsService.createPost({
    restaurantId: this.restaurantId, // ✅ CLAVE
    title: this.title,
    content: this.content,
    imageUrl: this.imageUrl || undefined,
  }).subscribe({
    next: () => {
      this.message.success('Post creado correctamente');
      this.title = '';
      this.content = '';
      this.imageUrl = '';
      this.loadPosts();
      this.saving = false;
    },
    error: (err) => {
      this.message.error(err.error?.message || 'Error al crear post');
      this.saving = false;
    }
  });
}

  toggleActive(post: RestaurantPost): void {
    this.restaurantsService.updatePost(post.postId, {
      isActive: !post.isActive,
    }).subscribe({
      next: () => {
        post.isActive = !post.isActive;
      }
    });
  }

  deletePost(postId: number): void {
    this.restaurantsService.deletePost(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.postId !== postId);
        this.message.success('Post eliminado');
      }
    });
  }
}
