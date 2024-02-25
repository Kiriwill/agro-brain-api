
import express, {Express,NextFunction,Request,Response} from 'express';
import {Crop, Farm, Service} from '../service/service';
import {AppError, HttpCode} from './errorHandler';
import logger from './logger';

const farmRouter = (svc: Service) => {
	var router = express.Router();
	
	router.post('/', async (req: Request, res: Response, next: NextFunction) => {
		try {
			let farm = Farm.create(req.body);
			if (Object.keys(farm).length === 0){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid resource"
				});
			}
			await svc.createFarm(farm);
			res.json(farm);
		} catch (error) {
			logger.error("something went wrong on saving farmer")
			next(error)
		}
	})

		router.put('/:farmId', async (req: Request, res: Response, next: NextFunction) => {
		try {
			const farm = Farm.create(req.body);
			if (Object.keys(farm).length === 0){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid resource"
				});
			}
			
			await svc.updateFarm(farm, req.params.farmId);
			res.json(farm);
		} catch (error) {
			logger.error("something went wrong on saving farmer")
			next(error)
		}

	})

	router.post('/:farmId/crops', async (req: Request, res: Response) => {
		if (!req.params.farmId) {
			return res.status(400).json({})
		}

		const farmId = req.params.farmId

		let crops:Crop[] = Crop.create(req.body);
		if (crops.length === 0){
			return res.status(400).json({})
		}

		const err = await svc.bindCrops(farmId, crops);
		if (err) {
			logger.error({
				level: 'error',
				message: "something went wrong on saving crops",
				meta: err
			})
			res.status(400).send();
			return
		}

		res.json();
	})

	router.get('/dashboard', async (req: Request, res: Response) => {
		try {
			const dashboard = await svc.buildReport();
			res.json(dashboard);
		} catch (error) {
			logger.error({
				level: 'error',
				message: "something went wrong on getting datashboard",
				meta: error
			})
				res.status(400).send();
			}

		return
	})

	return router;
}

export default farmRouter;

