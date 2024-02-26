
import express, {NextFunction,Request,RequestHandler,Response, Router} from 'express';
import {Crop, Service} from '../service/service';
import {AppError, HttpCode} from '../errorHandler';
import logger from '../logger';

const cropRouter = (svc: Service, middleware: RequestHandler) => {
	var router:Router = express.Router();
	
	router.post('/', middleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			let crops = Crop.create(req.body);
			delete crops.id
			if (crops.length === 0){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid resource"
				});
			}
			await svc.createCrop(crops);
			res.json(crops);
		} catch (error) {
			logger.error("something went wrong on saving farmer", error)
			next(error)
		}
	})

	router.patch('/:cropId', middleware, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const crop = Crop.create(req.body);
			if (Object.keys(crop).length === 0){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid resource"
				});
			}
			
			await svc.updateCrop(crop, req.params.cropId);
			res.json(crop);
		} catch (error) {
			logger.error("something went wrong on saving farmer", error)
			next(error)
		}

	})

	return router;
}

export default cropRouter;

