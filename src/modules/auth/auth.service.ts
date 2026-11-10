import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { createRemoteJWKSet, errors, jwtVerify } from 'jose';
import { PrismaService } from '../../prisma.service';
import { User } from './interfaces/user.interface';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface AuthConfig {
  url: URL;
  anonKey: string;
}

export interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

@Injectable()
export class AuthService {
  private jwks?: ReturnType<typeof createRemoteJWKSet>;
  private jwksUrl?: string;

  constructor(private readonly prisma: PrismaService) {}

  async login(email: unknown, password: unknown): Promise<SupabaseSession> {
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      throw new BadRequestException('E-mail e senha são obrigatórios.');
    }
    const config = this.getConfig();
    const response = await this.requestAuth(
      new URL('/auth/v1/token?grant_type=password', config.url).toString(),
      config.anonKey,
      { email: email.trim(), password },
    );
    if (response.status === 400 || response.status === 401) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    if (!response.ok) {
      throw new ServiceUnavailableException('Não foi possível autenticar no Supabase Auth.');
    }
    return this.readSession(response);
  }

  async refresh(refreshToken: unknown): Promise<SupabaseSession> {
    if (typeof refreshToken !== 'string' || !refreshToken.trim()) {
      throw new BadRequestException('Refresh token obrigatório.');
    }
    const config = this.getConfig();
    const response = await this.requestAuth(
      new URL('/auth/v1/token?grant_type=refresh_token', config.url).toString(),
      config.anonKey,
      { refresh_token: refreshToken },
    );
    if (response.status === 400 || response.status === 401) {
      throw new UnauthorizedException('Sessão expirada. Faça login novamente.');
    }
    if (!response.ok) {
      throw new ServiceUnavailableException('Não foi possível renovar a sessão.');
    }
    return this.readSession(response);
  }

  async logout(accessToken: string): Promise<void> {
    const config = this.getConfig();
    const response = await this.requestAuth(
      new URL('/auth/v1/logout', config.url).toString(),
      config.anonKey,
      {},
      accessToken,
    );
    if (!response.ok) {
      throw new ServiceUnavailableException('Não foi possível encerrar a sessão no Supabase Auth.');
    }
  }

  async authenticate(token: string): Promise<User> {
    if (token.length > 16_384) {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
    const config = this.getConfig();
    const jwksAddress = new URL('/auth/v1/.well-known/jwks.json', config.url).toString();
    if (this.jwksUrl !== jwksAddress) {
      this.jwks = createRemoteJWKSet(new URL(jwksAddress));
      this.jwksUrl = jwksAddress;
    }

    let payload;
    try {
      ({ payload } = await jwtVerify(token, this.jwks!, {
        issuer: new URL('/auth/v1', config.url).toString().replace(/\/$/, ''),
        audience: 'authenticated',
        algorithms: ['ES256', 'RS256'],
      }));
    } catch (error) {
      if (
        error instanceof errors.JWTExpired ||
        error instanceof errors.JWTClaimValidationFailed ||
        error instanceof errors.JWSSignatureVerificationFailed ||
        error instanceof errors.JWSInvalid ||
        error instanceof errors.JWTInvalid
      ) {
        throw new UnauthorizedException('Token inválido ou expirado.');
      }
      throw new ServiceUnavailableException('Não foi possível validar a sessão no Supabase Auth.');
    }

    const sub = payload.sub;
    const email = payload.email;
    const tenantClaim = payload.tenant_id;
    const issuedAt = payload.iat;
    const expiresAt = payload.exp;
    if (
      typeof sub !== 'string' ||
      !UUID_PATTERN.test(sub) ||
      typeof email !== 'string' ||
      typeof issuedAt !== 'number' ||
      typeof expiresAt !== 'number'
    ) {
      throw new UnauthorizedException('Token sem identidade válida.');
    }

    if (tenantClaim !== undefined && (typeof tenantClaim !== 'string' || !UUID_PATTERN.test(tenantClaim))) {
      throw new UnauthorizedException('Token com tenant inválido.');
    }

    const memberships = await this.prisma.membership.findMany({
      where: {
        userId: sub,
        ...(typeof tenantClaim === 'string' ? { tenantId: tenantClaim } : {}),
      },
      select: { tenantId: true, role: true },
      take: 2,
    });
    if (memberships.length !== 1) {
      throw new UnauthorizedException(
        memberships.length === 0
          ? 'Usuário sem vínculo ativo com este tenant.'
          : 'Token sem tenant selecionado. Configure o claim tenant_id no Supabase Auth.',
      );
    }
    const membership = memberships[0];
    if (!membership || !['colaborador', 'operacao', 'admin'].includes(membership.role)) {
      throw new UnauthorizedException('Usuário sem vínculo ativo com este tenant.');
    }

    return {
      sub,
      email,
      tenantId: membership.tenantId,
      role: membership.role as User['role'],
      iat: issuedAt,
      exp: expiresAt,
    };
  }

  private getConfig(): AuthConfig {
    const rawUrl = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    if (!rawUrl || !anonKey) {
      throw new ServiceUnavailableException('SUPABASE_URL e SUPABASE_ANON_KEY precisam estar configuradas.');
    }
    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      throw new ServiceUnavailableException('SUPABASE_URL inválida.');
    }
    if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) {
      throw new ServiceUnavailableException('SUPABASE_URL deve usar HTTPS.');
    }
    return { url: new URL(url.origin), anonKey };
  }

  private async requestAuth(
    url: string,
    anonKey: string,
    body: object,
    accessToken?: string,
  ): Promise<Response> {
    try {
      return await fetch(url, {
        method: 'POST',
        headers: {
          apikey: anonKey,
          'content-type': 'application/json',
          ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(body),
      });
    } catch {
      throw new ServiceUnavailableException('Supabase Auth está indisponível.');
    }
  }

  private async readSession(response: Response): Promise<SupabaseSession> {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new ServiceUnavailableException('Supabase Auth retornou uma resposta inválida.');
    }
    if (
      typeof body !== 'object' ||
      body === null ||
      !('access_token' in body) ||
      !('refresh_token' in body) ||
      !('token_type' in body) ||
      !('expires_in' in body) ||
      typeof body.access_token !== 'string' ||
      typeof body.refresh_token !== 'string' ||
      typeof body.token_type !== 'string' ||
      typeof body.expires_in !== 'number'
    ) {
      throw new ServiceUnavailableException('Supabase Auth retornou uma sessão inválida.');
    }
    return {
      access_token: body.access_token,
      refresh_token: body.refresh_token,
      token_type: body.token_type,
      expires_in: body.expires_in,
    };
  }
}
