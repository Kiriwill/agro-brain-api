import express, {Express,NextFunction,Request,RequestHandler,Response, Router} from 'express';
import {Farmer, Service, Farm} from '../service/service';
import {AppError, HttpCode} from '../errorHandler';
import logger from '../logger';
import {ValidationError} from 'class-validator';

const farmerRouter = (svc: Service, middleware: RequestHandler) => {
	var router:Router = express.Router();
	
	router.post('/', middleware, async (req: Request, res: Response, next: NextFunction):Promise<void> => {
		try {
			let farmers = Farmer.create(req.body);
			if (farmers.length === 0 ){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid resource"
				});
				
			}

			await svc.createFarmer(farmers);
			res.json(farmers);
		} catch (error:any) {
			logger.error("something went wrong on saving farmer: ", error)
			next(error)
		}

	})

	router.patch('/:farmerId', middleware, async (req: Request, res: Response, next: NextFunction):Promise<void> => {
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
			logger.error( "something went wrong on updating farmer", error)
			next(error)
		}
	})

	router.delete('/:farmerId', middleware, async (req: Request, res: Response, next: NextFunction):Promise<void> => {
		try {
			await svc.removeFarmer(req.params.farmerId);
			res.send();
		} catch (error) {
			logger.error("something went wrong on removing farmer", error)
			next(error)
		}
	})

	router.post('/:farmerId/farms', middleware, async (req: Request, res: Response, next: NextFunction):Promise<void> => {
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
			logger.error("something went wrong on binding farmer", error)
			next(error)
		}
	})

	return router;
}

export default farmerRouter;
