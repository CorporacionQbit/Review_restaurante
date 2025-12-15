import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Subscription } from '../subscriptions/subscription.entity';

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn({ name: 'payment_id' })
  paymentId: number;


  // RELACIÓN CON SUBSCRIPTION

  @Column({ name: 'subscription_id' })
  subscriptionId: number;

  @ManyToOne(() => Subscription, (sub) => sub.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

 
  // DATOS DEL PAGO

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 20 })
  status: 'PENDING' | 'PAID' | 'FAILED';

  @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
  paymentMethod?: string;

  @Column({
    name: 'transaction_reference',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  transactionReference?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt?: Date;
}
