import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Review } from './review.entity';
import { User } from '../users/user.entity';
@Entity({ name: 'review_moderation_logs' })
export class ReviewModerationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'review_id' })
  reviewId: number;

  @ManyToOne(() => Review, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @Column({ name: 'admin_user_id' })
  adminUserId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'admin_user_id' })
  admin: User; // 🔥 ESTE NOMBRE ES CLAVE

  @Column({ type: 'varchar', length: 20 })
  action: 'APROBADA' | 'RECHAZADA';

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
