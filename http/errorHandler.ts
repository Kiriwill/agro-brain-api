import {Response} from 'express';
import logger from './logger';

export enum HttpCode {
  OK = 200,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

interface ErrorObject {
  httpCode: HttpCode;
  description: string;
}

export class AppError extends Error {
  public readonly httpCode: HttpCode;

  constructor(args: ErrorObject) {
    super(args.description);
    Object.setPrototypeOf(this, new.target.prototype);
    this.httpCode = args.httpCode;
    Error.captureStackTrace(this);
  }
}

class ErrorHandler {
	public handleError(error: AppError, res?: Response): void {
		if (error instanceof AppError && res) {
			res.status(error.httpCode).json({ message: error.message });
		} else {
			this.handleCriticalError(res)
		}
	}

	private handleCriticalError(res?: Response): void {
		if (res) {
		  	res
			.status(HttpCode.INTERNAL_SERVER_ERROR)
			.json({ message: 'Internal server error' });
		}

		logger.error('Application encountered a critical error. Exiting');
		process.exit(1);
	}
}

export const errorHandler = new ErrorHandler();
