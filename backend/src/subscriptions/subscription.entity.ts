import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Restaurant } from '../restaurants/restaurant.entity';
import { Payment } from '../payments/payments.entity';

@Entity({ name: 'subscriptions' })
export class Subscription {
  @PrimaryGeneratedColumn({ name: 'subscription_id' })
  subscriptionId: number;

  // RELACIÓN CON RESTAURANT

  @Column({ name: 'restaurant_id' })
  restaurantId: number;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.subscription, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;


  // DATOS DE PLAN

  @Column({ name: 'plan_type', type: 'varchar', length: 50 })
  planType: 'Normal' | 'Premium';

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ name: 'price', type: 'numeric', precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({
    name: 'billing_period',
    type: 'varchar',
    length: 20,
    default: 'MONTHLY',
  })
  billingPeriod: 'MONTHLY' | 'YEARLY';

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'canceled_at', type: 'timestamp', nullable: true })
  canceledAt?: Date;

  @Column({ name: 'cancel_reason', type: 'text', nullable: true })
  cancelReason?: string;


  // RELACIÓN CON PAYMENTS
 
  @OneToMany(() => Payment, (payment) => payment.subscription)
  payments: Payment[];
}
