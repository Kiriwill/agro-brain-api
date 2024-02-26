import express, {NextFunction,Request,Response, Router} from 'express';
import {Crop, Service, User} from '../service/service';
import {AppError, HttpCode} from '../errorHandler';
import logger from '../logger';

const userRouter = (svc: Service) => {
	var router:Router = express.Router();
	
	router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			let user = User.create(req.body);
			if (Object.keys(user).length === 0){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid resource"
				});
			}

			await svc.registerUser(user);
			res.end();
		} catch (error) {
			logger.error("something went wrong on saving user", error)
			next(error)
		}
	})

	router.post('/login', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			let user = User.create(req.body);
			if (Object.keys(user).length === 0){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid resource"
				});
			}

			const token = await svc.loginUser(user);
			if (!token){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid request"
				});
			}

			res.set("x-Access-Token", token);
			res.end();
		} catch (error) {
			logger.error("something went wrong on saving user", error)
			next(error)
		}
	})

	return router;
}

export default userRouter;

