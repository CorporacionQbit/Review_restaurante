// src/post/post.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Restaurant } from '../restaurants/restaurant.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn({ name: 'post_id' })
  postId: number;

  @ManyToOne(() => Restaurant, (r) => r.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
