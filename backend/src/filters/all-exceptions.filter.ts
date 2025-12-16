import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const timestamp = new Date().toISOString();

    // Default para errores no controlados
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message: any = 'Error interno del servidor';

    // Si es HttpException (NotFound, Forbidden, BadRequest, etc.)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();

      // Nest puede devolver string o objeto
      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response) {
        const r: any = response;
        message = r.message ?? message;
        error = r.error ?? exception.name;
      }
    }

    res.status(status).json({
      statusCode: status,
      error,
      message,
      path: req.originalUrl,
      timestamp,
    });
  }
}
