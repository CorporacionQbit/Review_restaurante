// src/subscriptions/payment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Subscription } from './subscription.entity';

@Entity({ name: 'payments' })
export class Payment {

  @PrimaryGeneratedColumn({ name: 'payment_id' })
  paymentId: number;

  @Column({ name: 'subscription_id' })
  subscriptionId: number;

  @ManyToOne(() => Subscription)
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @Column({ name: 'amount', type: 'numeric' })
  amount: number;

  @Column({ name: 'currency', type: 'varchar', length: 10, default: 'GTQ' })
  currency: string;

  @Column({ name: 'status', type: 'varchar', length: 20 })
  status: 'PENDING' | 'PAID' | 'FAILED';

  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
  paymentMethod?: string;

  @Column({ name: 'transaction_reference', type: 'varchar', length: 255, nullable: true })
  transactionReference?: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt?: string;
}
