import createError from 'http-errors';
import express, {Express,NextFunction,Request,Response} from 'express';
import path from 'path';
import morgan from 'morgan'
import dotenv from "dotenv";

import {Service} from '../service/service';
import farmerRouter from './farmer';
import farmRouter from './farm';
import logger from './logger';
import cropRouter from './crop';
import {AppError, errorHandler} from './errorHandler';

function New(svc: Service): void {
	dotenv.config();

	var app = express();
	const port = process.env.PORT || 3000;

	// Middlewares
	app.use(morgan('dev'));
	app.use(express.json());
	app.use(express.urlencoded({ extended: true })); //how to encode body
	
	// Routes
	app.use('/farmer', farmerRouter(svc));
	app.use('/farm', farmRouter(svc));
	app.use('/crop', cropRouter(svc));

	// Error Handler
	app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
		errorHandler.handleError(err, res);
	})

	app.listen(port, () => {
	  logger.info(`[server]: Server is running at http://localhost:${port}`);
	});
	
}

export default New;
