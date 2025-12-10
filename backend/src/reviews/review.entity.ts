// src/reviews/review.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Restaurant } from '../restaurants/restaurant.entity';

@Entity({ name: 'reviews' })
export class Review {
  @PrimaryGeneratedColumn({ name: 'review_id' })
  reviewId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'restaurant_id' })
  restaurantId: number;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ name: 'review_text', type: 'text', nullable: true })
  reviewText: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'varchar', length: 20, default: 'Pendiente' })
  status: 'Pendiente' | 'Aprobada' | 'Rechazada';

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;
}
