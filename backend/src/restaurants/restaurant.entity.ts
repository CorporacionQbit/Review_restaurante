// src/restaurants/restaurant.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from '../users/user.entity';
import { RestaurantImage } from './restaurant-image.entity';
import { Review } from '../reviews/review.entity';
import { Menu } from '../menu/menu.entity';
import { Post } from '../post/post.entity';
import { Subscription } from '../subscriptions/subscription.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn({ name: 'restaurant_id' })
  restaurantId: number;

  @Column({ name: 'owner_user_id' })
  ownerUserId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_user_id' })
  owner: User;

  @Column({ length: 255, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'phone_number', type: 'varchar', length: 50, nullable: true })
  phoneNumber: string | null;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ name: 'address', type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ name: 'zone', type: 'varchar', length: 50, nullable: true })
  zone: string | null;

  @Column({ name: 'maps_url', type: 'varchar', length: 500, nullable: true })
  mapsUrl: string | null;

  @Column({ name: 'price_range', type: 'smallint', nullable: true })
  priceRange: number | null;

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
  onboardingStatus: 'Pendiente' | 'EnRevision' | 'Aprobado';

  @Column({ name: 'onboarding_comment', type: 'text', nullable: true })
  onboardingComment: string | null;

  // ================= RELACIONES =================

  @OneToMany(() => RestaurantImage, (img) => img.restaurant)
  images: RestaurantImage[];

  @OneToMany(() => Menu, (menu) => menu.restaurant, { cascade: true })
  menus: Menu[];

  @OneToMany(() => Review, (review) => review.restaurant)
  reviews: Review[];

  @OneToMany(() => Post, (post) => post.restaurant, { cascade: true })
  posts: Post[];

  @OneToOne(() => Subscription, (sub) => sub.restaurant)
  subscription: Subscription;
}