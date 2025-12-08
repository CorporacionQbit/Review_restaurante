// src/users/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName: string;

  @Column({ name: 'bio', type: 'text', nullable: true })
  bio?: string;

  @Column({ name: 'profile_picture_url', type: 'varchar', length: 500, nullable: true })
  profilePictureUrl?: string;

  @Column({ name: 'location', type: 'varchar', length: 100, nullable: true })
  location?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'registration_method', type: 'varchar', length: 50, default: 'email' })
  registrationMethod: string;

  @Column({ name: 'role', type: 'varchar', length: 20, default: 'client' })
role: string; /* Tipo de usuario cliente, dueño o admin  */

}
