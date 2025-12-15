import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Restaurant } from '../restaurants/restaurant.entity';

@Entity({ name: 'menus' })
export class Menu {
  @PrimaryGeneratedColumn({ name: 'menu_id' })
  menuId: number;

  @Column({ name: 'menu_url', type: 'varchar', length: 500 })
  menuUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;
}
