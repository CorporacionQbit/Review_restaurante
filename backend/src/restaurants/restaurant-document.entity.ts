import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity('restaurant_documents')
export class RestaurantDocument {
  @PrimaryGeneratedColumn({ name: 'document_id' })
  documentId: number;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column({ name: 'doc_type', length: 50 })
  docType: 'RTU' | 'PATENTE';

  @Column({ name: 'file_url', length: 500 })
  fileUrl: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;
}
