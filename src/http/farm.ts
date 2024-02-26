
import express, {Express,NextFunction,Request,RequestHandler,Response, Router} from 'express';
import {Crop, Farm, Service} from '../service/service';
import {AppError, HttpCode} from '../errorHandler';
import logger from '../logger';

const farmRouter = (svc: Service, middleware: RequestHandler) => {
	var router:Router = express.Router();
		
	router.post('/', middleware, async (req: Request, res: Response, next: NextFunction):Promise<void> => {
		try {
			const farms:Farm[] = [];
			if (!req.body.length){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid resource"
				});
			}
			for (const b of req.body) {
				let farm = new Farm();
				farm.name = b.name;
				farm.state = b.state;
				farm.city = b.city;
				farm.totalArea = parseInt(b.totalArea);
				farm.cropArea = parseInt(b.cropArea);
				farm.vegetableArea = parseInt(b.vegetableArea);
				farms.push(farm);
			}
			await svc.createFarm(farms);
			res.json(farms);
		} catch (error) {
			logger.error("something went wrong on saving farm", error)
			next(error)
		}
	})

	router.patch('/:farmId', middleware, async (req: Request, res: Response, next: NextFunction):Promise<void> => {
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
			logger.error("something went wrong on saving farm", error)
			next(error)
		}

	})

	router.post('/:farmId/crops', middleware, async (req: Request, res: Response, next: NextFunction):Promise<void> => {
		try{
			const farmId = req.params.farmId

			let crops:Crop[] = Crop.create(req.body);
			if (crops.length === 0){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid resource"
				});
			}

			await svc.bindCrops(farmId, crops);
			res.end();
		} catch(error) {
			logger.error("something went wrong on saving farm", error)
			next(error)
		}

	})

	router.get('/dashboard', middleware, async (req: Request, res: Response, next: NextFunction) => {
		try {
			const dashboard = await svc.buildReport();
			res.json(dashboard);
		} catch (error) {
			logger.error("something went wrong on getting dashboard", error)
			next(error)
		}
	})

	return router;
}

export default farmRouter;

