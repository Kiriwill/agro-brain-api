
import express, {Express,NextFunction,Request,Response} from 'express';
import {Crop, Service} from '../service/service';
import {AppError, HttpCode} from './errorHandler';
import logger from './logger';

const cropRouter = (svc: Service) => {
	var router = express.Router();
	
	router.post('/', async (req: Request, res: Response, next: NextFunction) => {
		try {
			let crop = Crop.create(req.body);
			if (Object.keys(crop).length === 0){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid resource"
				});
			}
			await svc.createCrop(crop);
			res.json(crop);
		} catch (error) {
			logger.error("something went wrong on saving farmer", error)
			next(error)
		}
	})

	router.put('/:cropId', async (req: Request, res: Response, next: NextFunction) => {
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
			logger.error("something went wrong on saving farmer")
			next(error)
		}

	})

	return router;
}

export default cropRouter;

