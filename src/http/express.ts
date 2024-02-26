import express, {Express,NextFunction,Request,Response, Router} from 'express';
import morgan from 'morgan'

import {Service} from '../service/service';
import farmerRouter from './farmer';
import farmRouter from './farm';
import logger from '../logger';
import cropRouter from './crop';
import {AppError, errorHandler} from '../errorHandler';
import userRouter from './user';
import {jwtHandler} from '../service/auth';

function New(svc: Service): void {
	var app:Express = express();
	const port = process.env.PORT;

	// Middlewares
	app.use(morgan('dev'));
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	
	// Routes
	const router:Router = express.Router();
	app.use("/api/v1", router);
	router.use("/user", userRouter(svc))

	router.use('/farmer', farmerRouter(svc, jwtHandler.handleRequest));
	router.use('/farm', farmRouter(svc, jwtHandler.handleRequest));
	router.use('/crop', cropRouter(svc, jwtHandler.handleRequest));


	// Error Handler
	app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
		errorHandler.handleError(err, res);
	})

	app.listen(port, () => {
	  logger.info(`[server]: Server is running at http://localhost:${port}`);
	});
	
}

export default New;
