import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.fullName);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('login-restaurant')
  loginRestaurant(@Body() dto: LoginDto) {
    return this.authService.loginRestaurant(dto.email, dto.password);
  }

  // ===== GOOGLE OAUTH =====

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Redirección automática a Google
  }

 @Get('google/callback')
@UseGuards(AuthGuard('google'))
async googleCallback(@Req() req: any, @Res() res: Response) {
  const googleUser = req.user;

  const result = await this.authService.loginWithGoogle(googleUser);

  res.redirect(
    `http://localhost:4200/auth/google-success?token=${result.accessToken}`,
  );
}
}