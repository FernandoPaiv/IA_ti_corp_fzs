import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    const match = typeof authorization === 'string' && authorization.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      throw new UnauthorizedException('Bearer token obrigatório.');
    }

    const user = await this.authService.authenticate(match[1]);
    request.user = user;
    request.authenticatedUser = {
      id: user.sub,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
    return true;
  }
}
