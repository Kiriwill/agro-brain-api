import {isUUID, validateOrReject, ValidationError} from "class-validator";
import {Service, Repo, Farmer, Farm, Crop, Dashboard, User} from "./service"
import {MoreThan} from "typeorm";
import {AppError, HttpCode} from "../errorHandler";
import logger from "../logger";
import hashPass, {sign} from "./auth";

class AgroService implements Service {
	private repo: Repo;

	constructor(repo: Repo) {
		this.repo = repo;
	}
	
	public async registerUser(user: User): Promise<void> {
		await validateOrReject(user);
		const u:User|null = await this.repo.searchUser(user.username);
		if (u) {
			throw new AppError({
				httpCode: HttpCode.BAD_REQUEST,
				description: "username already exists"
			})
		}

		user.password = await hashPass(user.password);
		await this.repo.insertUser(user)

	}

	public async loginUser(user: User): Promise<string | void> {
		const u:User|null = await this.repo.searchUser(user.username);
		if (!u) {
			throw new AppError({
				httpCode: HttpCode.BAD_REQUEST,
				description: "username already exists"
			})
		}
		
		return sign(user.username, user.password, u.password);
	}

	public async createFarmer(farmers: Farmer[]): Promise<void> {
		for (const f of farmers){
			if (f.cpf && f.cnpj) {
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: `invalid fields: cpf and cnpj, choose one`
				})
			}
			await validateOrReject(f);
		};
		await this.repo.insertFarmer(farmers);
	}

	public async updateFarmer(farmer: Farmer, id: string): Promise<void> {
		await validateOrReject(farmer, { skipMissingProperties: true });
		await this.repo.updateFarmer(farmer, id);
	}
	
	public async removeFarmer(id: string): Promise<void> {
		await this.repo.deleteFarmer(id);
	}

	public async bindFarms(farmerId: string, farms: Farm[]): Promise<void> {
		for (const f of farms){
			await validateOrReject(f, { skipMissingProperties: true });
		}
		await this.repo.bindFarms(farmerId, farms);
	}

	public async createFarm(farms: Farm[]): Promise<void> {
		for (const f of farms){
			if ((f.cropArea + f.vegetableArea) > f.totalArea) {
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid area"
				});
			}
			await validateOrReject(f);
		}

		await this.repo.insertFarm(farms);
	}

	public async updateFarm(farm: Farm, id: string): Promise<void> {
		if (!isUUID(id)){
			throw new AppError({
				httpCode: HttpCode.NOT_FOUND,
				description: "resource not found"
			});
		}

		const stored:Farm|null = await this.repo.searchFarm(id);
		if (!stored) {
			throw new AppError({
				httpCode: HttpCode.NOT_FOUND,
				description: "resource not found"
			});
		}

		const totalArea = farm.totalArea | stored.totalArea;
		const vegArea = farm.vegetableArea | stored.vegetableArea;
		const cropArea = farm.cropArea | stored.cropArea;

		if ((cropArea + vegArea) > totalArea) {
			throw new AppError({
				httpCode: HttpCode.BAD_REQUEST,
				description: "invalid area"
			});
		}

		await validateOrReject(farm, { skipMissingProperties: true });
		await this.repo.updateFarm(farm, id);
	}


	public async createCrop(crops: Crop[]): Promise<void> {
		for (const c of crops){
			await validateOrReject(c);
		}
		await this.repo.insertCrop(crops);
	}

	public async updateCrop(crop: Crop, id: string): Promise<void> {
		await validateOrReject(crop, { skipMissingProperties: true });
		await this.repo.updateCrop(crop, id);
	}

	public async bindCrops(farmId: string, crops: Crop[]): Promise<void> {
		for (const f of crops){
			await validateOrReject(f, { skipMissingProperties: true });
		}

		await this.repo.bindCrops(farmId, crops);
	}

	public async buildReport(): Promise<Dashboard> {
		const total = await this.repo.selectTotalAreaCount({ totalArea: MoreThan(0) });
		const vegetableTotal = await this.repo.selectTotalVegetable({ vegetableArea: MoreThan(0) });
		const cropTotal = await this.repo.selectTotalCrop({ cropArea: MoreThan(0) });

		const areabyState = await this.repo.selectTotalby('state', 'total_area');
		const vegetablebyState = await this.repo.selectTotalby('state', 'vegetable_area');
		const cropsbyState = await this.repo.selectTotalby('state', 'crop_area');

		const areabyCrop = await this.repo.selectAreaByCrop();
		
		return {total,vegetableTotal, cropTotal, areabyState, vegetablebyState, cropsbyState, areabyCrop};
	}

}


export default function NewService(repo: Repo): Service {
	return new AgroService(repo);
}

