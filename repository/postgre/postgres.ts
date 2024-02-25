import {BaseEntity, DataSource, DeleteResult, MoreThan, UpdateResult} from "typeorm";
import {PickKeysByType} from "typeorm/common/PickKeysByType";
import {AppError, HttpCode} from "../../http/errorHandler";
import logger from "../../http/logger";
import { Repo, Farmer, Crop, Farm } from "../../service/service";

class PGRepository implements Repo {
	constructor(url: URL){
		const dataSource = new DataSource({
			type: "postgres",
			host: url.host,
			port: +url.port,
			username: url.username,
			password: url.password,
			database: url.pathname.substring(1),
			synchronize: true,
			logging: true,
			entities: [Farmer, Crop, Farm],
			subscribers: [],
			migrations: [],
		})

		dataSource.initialize().then((conn) => {
			console.log("Data Source has been initialized!");
		})
		.catch((err) => {
			throw new Error(`error during data source initialization: \n${err}`);
		})
	}

	public async insertFarmer(farmer: Farmer): Promise<Object | Object[] | unknown>{
		try {
			await Farmer.insert(farmer);
			return 
		} catch (error:any) {
			logger.error(error)
			if (error.code){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid request"
				})
			}

			throw error
		}
	}

	public async updateFarmer(farmer: Farmer, id: number): Promise<Object | Object[] | unknown>{
		try {
			const res:UpdateResult = await Farmer.update(id, farmer);
			if (res.affected === 0){
				throw new AppError({
					httpCode: HttpCode.NOT_FOUND,
					description: "resource not found"
				});
			} 
		} catch (error: any) {
			logger.error(error);
			if (error instanceof AppError) {
				throw error
			}
			if (error.code){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid request"
				})
			}

			throw error
		}

		return
	}

	public async deleteFarmer(id: number): Promise<Object | Object[] | unknown>{
		try {
			const res:DeleteResult = await Farmer.createQueryBuilder().delete().where({ id: id}).execute();	
			if (res.affected === 0){
				throw new AppError({
					httpCode: HttpCode.NOT_FOUND,
					description: "resource not found"
				});
			} 
			return 
		} catch (error: any) {
			logger.error(error);
			if (error instanceof AppError) {
				throw error
			}
			if (error.code){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid request"
				})
			}

			throw error
		}
	}

	public async bindFarms(farmerId: number, farms: Farm[]): Promise<Object | Object[] | unknown>{
		try {
			const farmer = await Farmer.createQueryBuilder().where({ id: farmerId }).getOne();
			if (farmer == undefined) {
				throw new AppError({
					httpCode: HttpCode.NOT_FOUND,
					description: "resource not found"
				});
			}
			await Farmer.createQueryBuilder().relation("farms").of(farmer).add(farms);
			return 
		} catch (error: any) {
			if (error.code){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid request"
				})
			}

			throw error
		}
	}

	public async insertFarm(farm: Farm): Promise<Object | Object[] | unknown>{
		try {
			await Farm.insert(farm);
			return 
		} catch (error:any) {
			logger.error(error)
			if (error.code){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid request"
				})
			}

			throw error
		}

	}

	public async updateFarm(farm: Farm, id: number): Promise<Object | Object[] | unknown>{
		try {
			const res:UpdateResult = await Farm.update(id, farm);
			if (res.affected === 0){
				throw new AppError({
					httpCode: HttpCode.NOT_FOUND,
					description: "resource not found"
				});
			} 
		} catch (error: any) {
			logger.error(error);
			if (error instanceof AppError) {
				throw error
			}
			if (error.code){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid request"
				})
			}

			throw error
		}

		return
	}


	public async insertCrop(crop: Crop): Promise<Object | Object[] | unknown>{
		try {
			await Crop.insert(crop);
			return 
		} catch (error:any) {
			logger.error(error)
			if (error.code){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid request"
				})
			}

			throw error
		}
	}

	public async updateCrop(crop: Crop, id: number): Promise<Object | Object[] | unknown>{
		try {
			const res:UpdateResult = await Crop.update(id, crop);
			if (res.affected === 0){
				throw new AppError({
					httpCode: HttpCode.NOT_FOUND,
					description: "resource not found"
				});
			} 
		} catch (error: any) {
			logger.error(error);
			if (error instanceof AppError) {
				throw error
			}
			if (error.code){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid request"
				})
			}

			throw error
		}
		return
	}

	public async bindCrops(farmId: number, crops: Crop[]): Promise<Object | Object[] | unknown>{
		try {	
			const farm = await Farm.createQueryBuilder().where({ id: farmId}).getOne()
			if (farm == undefined) {
				throw new AppError({
					httpCode: HttpCode.NOT_FOUND,
					description: "resource not found"
				});
			}
			await Farm.createQueryBuilder().relation("crops").of(farm).add(crops);
			return 
		} catch (error: any) {
			if (error.code){
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid request"
				})
			}

			throw error
		}
	}

	public async selectTotalAreaCount(where: object): Promise<Object | Object[] | unknown>{
		try {
			const count = await Farm.count();
			const totalArea = await Farm.sum("totalArea", where)
			return {count, totalArea};
		} catch (error) {
			throw error;
		}
	}
	
	public async selectTotalVegetable(where: object): Promise<Object | Object[] | unknown>{
		try {
			const total = await Farm.sum("vegetableArea", where)
			return total;
		} catch (error) {
			throw error;
		}
	}
	
	public async selectTotalCrop(where: object): Promise<Object | Object[] | unknown>{
		try {
			const total = await Farm.sum("cropArea", where)
			return total;
		} catch (error) {
			throw error;
		}
	}

	public async selectTotalby(byColumn:string, selectColumn:string): Promise<Object | Object[] | unknown>{
		try {
			const total = await Farm.createQueryBuilder().select(byColumn).addSelect(`SUM(${selectColumn})`, "sum").groupBy(byColumn).getRawMany()
			return total;
		} catch (error) {
			throw error;
		}
	}

	public async selectAreaByCrop(): Promise<Object | Object[] | unknown>{
		try {
			const total = await Farm.createQueryBuilder()
				.select("crop.cropArea")
				.addSelect("COUNT(*)", "cropCount")
				.from("farm_crops_crop", "farm_crop")
				.innerJoin("farm", "farm", "farm.id = farm_crop.farmId")
				.innerJoin("crop", "crop", "crop.id = farm_crop.cropId")
				.groupBy("crop.name")
				.getRawMany();

			return total;
		} catch (error) {
			throw error;
		}
	}

}


export default PGRepository;
