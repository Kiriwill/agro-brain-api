import express, {Express,NextFunction,Request,Response} from 'express';
import {Farmer, Service, Farm} from '../service/service';
import {AppError, HttpCode} from './errorHandler';
import logger from './logger';

const farmerRouter = (svc: Service) => {
	var router = express.Router();
	
	router.post('/', async (req: Request, res: Response, next: NextFunction) => {
		try {
			let farmer = Farmer.create(req.body);
			if (Object.keys(farmer).length === 0){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid resource"
				});
				
			}

			await svc.createFarmer(farmer);
			res.json(farmer);
		} catch (error) {
			logger.error("something went wrong on saving farmer")
			next(error)
		}

	})

	router.put('/:farmerId', async (req: Request, res: Response, next: NextFunction) => {
		try {
			const farmer = Farmer.create(req.body);
			if (Object.keys(farmer).length === 0){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid resource"
				});
			}
			
			await svc.updateFarmer(farmer, req.params.farmerId);
			res.json(farmer);

		} catch (error) {
			logger.error( "something went wrong on updating farmer")
			next(error)
		}
	})

	router.delete('/:farmerId', async (req: Request, res: Response, next: NextFunction) => {
		try {
			await svc.removeFarmer(req.params.farmerId);
			res.send();
		} catch (error) {
			logger.error("something went wrong on removing farmer")
			next(error)
		}
	})

	router.post('/:farmerId/farms', async (req: Request, res: Response, next: NextFunction) => {
		try {
			const farmerId = req.params.farmerId

			let farms: Farm[] = Farm.create(req.body);
			if (farms.length === 0){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid resource"
				});
			}

			await svc.bindFarms(farmerId, farms);
			res.send();
		} catch(error) {
			logger.error("something went wrong on binding farmer")
			next(error)
		}
	})

	return router;
}

export default farmerRouter;
