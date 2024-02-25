
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

	router.put('/:cropId', async (req: Request, res: Response) => {
		const crop = Crop.create(req.body);
		if (Object.keys(crop).length === 0){
			return res.status(400).json({})
		}
		if (!req.params.cropId) {
			return res.status(400).json({})
		}
		
		const err = await svc.updateCrop(crop, req.params.cropId);
		if (err) {
			logger.error({
				level: 'error',
				message: "something went wrong on saving crop",
				meta: err
			})
			res.status(400).send();
			return
		}

		res.json(crop);
	})

	return router;
}

export default cropRouter;

