import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'restaurant_events' })
export class RestaurantEvent {
  @PrimaryGeneratedColumn({ name: 'event_id' })
  eventId: number;

  @Column({ name: 'restaurant_id', type: 'int' })
  restaurantId: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'event_type', type: 'varchar', length: 50 })
  eventType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
