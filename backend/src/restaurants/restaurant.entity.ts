import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity({ name: 'restaurants' })
export class Restaurant {
  @PrimaryGeneratedColumn({ name: 'restaurant_id' })
  restaurantId: number;

  @Column({ name: 'owner_user_id' })
  ownerUserId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_user_id' })
  owner: User;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  zone: string;

  @Column({ name: 'maps_url', nullable: true })
  mapsUrl: string;

  @Column({ name: 'price_range', type: 'smallint', nullable: true })
  priceRange: number;

  @Column({ name: 'avg_rating', type: 'numeric', default: 0 })
  avgRating: number;

  @Column({ name: 'total_reviews', default: 0 })
  totalReviews: number;

  @Column({ name: 'is_approved', default: false })
  isApproved: boolean;

  @Column({ name: 'is_premium', default: false })
  isPremium: boolean;

  @Column({ name: 'onboarding_status', default: 'Pendiente' })
  onboardingStatus: string;

  @Column({ name: 'onboarding_comment', type: 'text', nullable: true })
  onboardingComment: string;
}
