import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { SupabaseSession } from './auth.service';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email?: unknown; password?: unknown }): Promise<SupabaseSession> {
    return this.authService.login(body?.email, body?.password);
  }

  @Post('refresh')
  refresh(@Body() body: { refresh_token?: unknown }): Promise<SupabaseSession> {
    return this.authService.refresh(body?.refresh_token);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() request: Request): Promise<{ success: true }> {
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '') ?? '';
    await this.authService.logout(token);
    return { success: true };
  }
}
