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

@Entity({ name: 'review_reports' })
export class ReviewReport {
  @PrimaryGeneratedColumn({ name: 'report_id' })
  reportId: number;

  @Column({ name: 'review_id' })
  reviewId: number;

  @ManyToOne(() => Review, (review) => review.reviewId, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.userId, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  reason: string;

  @Column({ name: 'is_resolved', default: false })
  isResolved: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
