import { Controller, Post, Get, Patch, Delete, Param, Body, Req } from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Controller()
export class MenusController {
  constructor(private readonly service: MenusService) {}

 
  // ingresar menu solo modo primium 
 
  @Post('restaurants/:id/menu')
  create(@Param('id') id: string, @Req() req, @Body() dto: CreateMenuDto) {
    return this.service.create(req.user.userId, Number(id), dto);
  }

 
  //obtener menu 
 
  @Get('restaurants/:id/menu')
  find(@Param('id') id: string) {
    return this.service.findByRestaurant(Number(id));
  }


  // actualizar menu
 
  @Patch('menu/:menuId')
  update(@Param('menuId') menuId: string, @Req() req, @Body() dto: UpdateMenuDto) {
    return this.service.update(Number(menuId), req.user.userId, dto);
  }


  // eliminar menu

  @Delete('menu/:menuId')
  delete(@Param('menuId') menuId: string, @Req() req) {
    return this.service.delete(Number(menuId), req.user.userId);
  }
}
