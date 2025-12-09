// src/restaurants/restaurant.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { RestaurantImage } from './restaurant-image.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn({ name: 'restaurant_id' })
  restaurantId: number;

  @Column({ name: 'owner_user_id' })
  ownerUserId: number;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'owner_user_id' })
  owner: User;

  @Column({ length: 255, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  phoneNumber: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 50, nullable: true })
  zone: string;

  @Column({ name: 'maps_url', length: 500, nullable: true })
  mapsUrl: string;

  @Column({ name: 'price_range', type: 'smallint', nullable: true })
  priceRange: number;

  @Column({
    name: 'avg_rating',
    type: 'numeric',
    precision: 2,
    scale: 1,
    default: 0,
  })
  avgRating: number;

  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews: number;

  @Column({ name: 'is_approved', type: 'boolean', default: false })
  isApproved: boolean;

  @Column({ name: 'is_premium', type: 'boolean', default: false })
  isPremium: boolean;

  @Column({
    name: 'onboarding_status',
    type: 'varchar',
    length: 20,
    default: 'Pendiente',
  })
  onboardingStatus: string;

  @Column({ name: 'onboarding_comment', type: 'text', nullable: true })
  onboardingComment: string|null;

  @OneToMany(() => RestaurantImage, (img) => img.restaurant)
  images: RestaurantImage[];
}
