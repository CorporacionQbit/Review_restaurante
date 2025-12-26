import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Restaurant } from '../restaurants/restaurant.entity';

@Entity({ name: 'user_favorites' })
export class UserFavorite {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'restaurant_id' })
  restaurantId: number;

  @CreateDateColumn({ name: 'added_at' })
  addedAt: Date;

  // 🔗 Relaciones
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
