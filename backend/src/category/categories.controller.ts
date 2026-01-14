import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  ForbiddenException,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import type { AuthRequest } from '../auth/auth.middleware';

@Controller()
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  private ensureAdmin(req: AuthRequest) {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenException('Solo administradores');
    }
  }

  // =========================
  // 🔓 PÚBLICO (OWNER / CLIENTE)
  // GET /categories
  // =========================
  @Get('categories')
  getPublic() {
    return this.service.findAll();
  }

  // =========================
  // 🔒 ADMIN
  // =========================
  @Get('admin/categories')
  getAll(@Req() req: AuthRequest) {
    this.ensureAdmin(req);
    return this.service.findAll();
  }

  @Post('admin/categories')
  create(@Req() req: AuthRequest, @Body() dto: CreateCategoryDto) {
    this.ensureAdmin(req);
    return this.service.create(dto);
  }

  @Patch('admin/categories/:id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    this.ensureAdmin(req);
    return this.service.update(Number(id), dto);
  }

  @Delete('admin/categories/:id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    this.ensureAdmin(req);
    return this.service.remove(Number(id));
  }
}
