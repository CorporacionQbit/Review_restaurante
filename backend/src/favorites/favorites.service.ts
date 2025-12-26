import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class FavoritesService {
  constructor(private readonly dataSource: DataSource) {}

  async addFavorite(userId: number, restaurantId: number) {
    await this.dataSource.query(
      `
      INSERT INTO user_favorites (user_id, restaurant_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [userId, restaurantId],
    );

    return { message: 'Restaurante agregado a favoritos' };
  }

  async removeFavorite(userId: number, restaurantId: number) {
    await this.dataSource.query(
      `
      DELETE FROM user_favorites
      WHERE user_id = $1 AND restaurant_id = $2
      `,
      [userId, restaurantId],
    );

    return { message: 'Restaurante eliminado de favoritos' };
  }

  async getUserFavorites(userId: number) {
    return this.dataSource.query(
      `
      SELECT
        r.restaurant_id,
        r.name,
        r.description,
        r.avg_rating,
        r.total_reviews,
        r.is_premium
      FROM user_favorites uf
      JOIN restaurants r ON r.restaurant_id = uf.restaurant_id
      WHERE uf.user_id = $1
      ORDER BY uf.added_at DESC
      `,
      [userId],
    );
  }
}
