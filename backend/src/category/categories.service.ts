// src/categories/categories.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  // =========================
  // OBTENER TODAS
  // =========================
  findAll() {
    return this.categoryRepo.find({
      order: { name: 'ASC' },
    });
  }

  // =========================
  // CREAR
  // =========================
  async create(dto: CreateCategoryDto) {
    const exists = await this.categoryRepo.findOne({
      where: { name: dto.name },
    });

    if (exists) {
      throw new BadRequestException('La categoría ya existe');
    }

    const category = this.categoryRepo.create({
      name: dto.name.trim(),
    });

    return this.categoryRepo.save(category);
  }

  // =========================
  // ACTUALIZAR
  // =========================
  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.categoryRepo.findOne({
      where: { categoryId: id },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    if (dto.name) {
      category.name = dto.name.trim();
    }

    return this.categoryRepo.save(category);
  }

  // =========================
  // ELIMINAR
  // =========================
  async remove(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { categoryId: id },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    await this.categoryRepo.remove(category);
    return { success: true };
  }
}
