import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../interfaces/user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as User | undefined;
    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    if (!['colaborador', 'operacao', 'admin'].includes(user.role)) {
      throw new ForbiddenException('Role de usuário inválida.');
    }
    return true;
  }
}
