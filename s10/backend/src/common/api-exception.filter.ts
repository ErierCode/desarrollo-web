import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Response } from "express";

const ERROR_LABEL: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: "Bad Request",
  [HttpStatus.NOT_FOUND]: "Not Found",
  [HttpStatus.CONFLICT]: "Conflict",
  [HttpStatus.INTERNAL_SERVER_ERROR]: "Internal Server Error",
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response.status(status).json({
        statusCode: status,
        error: readErrorLabel(body, status),
        message: readMessages(body, exception.message),
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: ERROR_LABEL[HttpStatus.INTERNAL_SERVER_ERROR],
      message: ["Error interno del servidor"],
    });
  }
}

function readMessages(body: string | object, fallback: string): string[] {
  if (typeof body === "string") {
    return [body];
  }

  if ("message" in body) {
    const message = body.message;
    if (Array.isArray(message)) {
      return message.map((item) => String(item));
    }
    if (typeof message === "string") {
      return [message];
    }
  }

  return [fallback];
}

function readErrorLabel(body: string | object, status: number): string {
  if (typeof body !== "string" && "error" in body && typeof body.error === "string") {
    return body.error;
  }

  return ERROR_LABEL[status] ?? "Error";
}
