import {DataSource, DeleteResult, UpdateResult} from "typeorm";
import {AppError, HttpCode} from "../../errorHandler";
import logger from "../../logger";
import { Repo, Farmer, Crop, Farm, User } from "../../service/service";

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
			entities: [Farmer, Crop, Farm, User],
			subscribers: [],
			migrations: [],
		})

		dataSource.initialize().then((conn) => {
			logger.info("Data Source has been initialized!");
		})
		.catch((err) => {
			throw new Error(`error during data source initialization: \n${err}`);
		})
	}
	
	public async searchUser(username: string): Promise<User | null>{
		return await User.createQueryBuilder().where({ username: username }).getOne()
	}

	public async insertUser(user: User): Promise<void>{
		await User.insert(user);
	}

	public async insertFarmer(farmers: Farmer[]): Promise<void>{
		await Farmer.insert(farmers);
	}

	public async updateFarmer(farmer: Farmer, id: string): Promise<void>{
		const res:UpdateResult = await Farmer.update(id, farmer);
		if (res.affected === 0){
			throw new AppError({
				httpCode: HttpCode.NOT_FOUND,
				description: "resource not found"
			});
		} 
	}

	public async deleteFarmer(id: string): Promise<void>{
		const res:DeleteResult = await Farmer.createQueryBuilder().delete().where({ id: id}).execute();	
		if (res.affected === 0){
			throw new AppError({
				httpCode: HttpCode.NOT_FOUND,
				description: "resource not found"
			});
		} 

	}

	public async bindFarms(farmerId: string, farms: Farm[]): Promise<void>{
		const farmer = await Farmer.createQueryBuilder().where({ id: farmerId }).getOne();
		if (!farmer) {
			throw new AppError({
				httpCode: HttpCode.NOT_FOUND,
				description: "resource not found"
			});
		}
		await Farmer.createQueryBuilder().relation("farms").of(farmer).add(farms);
	}

	public async insertFarm(farms: Farm[]): Promise<void>{
		await Farm.insert(farms);
	}

	public async updateFarm(farm: Farm, id: string): Promise<void>{
		const res:UpdateResult = await Farm.update(id, farm);
		if (res.affected === 0){
			throw new AppError({
				httpCode: HttpCode.NOT_FOUND,
				description: "resource not found"
			});
		} 
	}

	public async searchFarm(id: string): Promise<Farm | null>{
		return await Farm.createQueryBuilder().where({ id: id }).getOne()
	}


	public async insertCrop(crops: Crop[]): Promise<void>{
		await Crop.insert(crops);
	}

	public async updateCrop(crop: Crop, id: string): Promise<void>{
		const res:UpdateResult = await Crop.update(id, crop);
		if (res.affected === 0){
			throw new AppError({
				httpCode: HttpCode.NOT_FOUND,
				description: "resource not found"
			});
		} 
	}

	public async bindCrops(farmId: string, crops: Crop[]): Promise<void>{
		const farm = await Farm.createQueryBuilder().where({ id: farmId}).getOne()
		if (!farm) {
			throw new AppError({
				httpCode: HttpCode.NOT_FOUND,
				description: "resource not found"
			});
		}
		await Farm.createQueryBuilder().relation("crops").of(farm).add(crops);
	}

	public async selectTotalAreaCount(where: object): Promise<object>{
		const count = await Farm.count();
		const area = await Farm.sum("totalArea", where)
		return {count, area};
	}
	
	public async selectTotalVegetable(where: object): Promise<number | null>{
		return await Farm.sum("vegetableArea", where)
	}
	
	public async selectTotalCrop(where: object): Promise<number | null>{
		return await Farm.sum("cropArea", where)
	}

	public async selectTotalby(byColumn:string, selectColumn:string): Promise<object[]>{
		return await Farm
			.createQueryBuilder()
			.select(byColumn)
			.addSelect(`SUM(${selectColumn})`, "sum")
			.groupBy(byColumn)
			.getRawMany()

	}

	public async selectAreaByCrop(): Promise<object[]>{
		return await Farm.createQueryBuilder()
			.select("crop.name")
			.addSelect("SUM(farm.cropArea)", "total")
			.from("farm_crops_crop", "farm_crop")
			.innerJoin("farm", "farm", "farm.id = farm_crop.farmId")
			.innerJoin("crop", "crop", "crop.id = farm_crop.cropId")
			.groupBy("crop.name")
			.getRawMany();
	}
}


export default PGRepository;
