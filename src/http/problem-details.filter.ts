import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const detail = typeof payload === 'string'
        ? payload
        : this.getDetail(payload, exception.message);
      response.status(status).type('application/problem+json').json({
        type: 'about:blank',
        title: this.getTitle(status),
        status,
        detail,
        instance: request.originalUrl || request.url,
      });
      return;
    }

    this.logger.error(
      'Unhandled request error',
      exception instanceof Error ? exception.stack : undefined,
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).type('application/problem+json').json({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: 'Ocorreu um erro interno.',
      instance: request.originalUrl || request.url,
    });
  }

  private getDetail(payload: unknown, fallback: string): string {
    if (typeof payload !== 'object' || payload === null || !('message' in payload)) {
      return fallback;
    }
    const message = payload.message;
    if (typeof message === 'string') {
      return message;
    }
    if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
      return message.join('; ');
    }
    return fallback;
  }

  private getTitle(status: number): string {
    const title = HttpStatus[status];
    return typeof title === 'string'
      ? title.toLowerCase().replace(/(^|_)([a-z])/g, (_, separator: string, letter: string) =>
        `${separator ? ' ' : ''}${letter.toUpperCase()}`,
      )
      : 'Error';
  }
}
