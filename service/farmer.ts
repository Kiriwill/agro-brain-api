import {validateOrReject, ValidationError} from "class-validator";
import {Service, Repo, Farmer, Farm, Crop} from "./service"
import {MoreThan} from "typeorm";
import {AppError, HttpCode} from "../http/errorHandler";

class AgroService implements Service {
	private repo: Repo;

	constructor(repo: Repo) {
		this.repo = repo;
	}
	
	public async createFarmer(farmer: Farmer): Promise<Object[] | Object | unknown> {
		try {
			await validateOrReject(farmer);
			await this.repo.insertFarmer(farmer);
			return;
		} catch (errors) {
			throw errors;
		}
	}

	public async updateFarmer(farmer: Farmer, id: string): Promise<Object[] | Object | unknown> {
		try {
			await validateOrReject(farmer, { skipMissingProperties: true });
			await this.repo.updateFarmer(farmer, parseInt(id));
			return;
		} catch (errors) {
			throw errors;
		}
	}
	
	public async removeFarmer(id: string): Promise<Object[] | Object | unknown> {
		try {
			await this.repo.deleteFarmer(parseInt(id));
			return;
		} catch (errors) {
			throw errors;
		}
	}

	public async bindFarms(farmerId: string, farms: Farm[]): Promise<Object[] | Object | unknown> {
		try {
			await this.repo.bindFarms(parseInt(farmerId), farms);
			return;
		} catch (errors) {
			throw errors;
		}
	}

	public async createFarm(farm: Farm): Promise<Object[] | Object | unknown> {
		try {
			if ((farm.cropArea + farm.vegetableArea) > farm.totalArea) {
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid area"
				});
			}

			await validateOrReject(farm);
			await this.repo.insertFarm(farm);
			return;
		} catch (errors) {
			throw errors;
		}
	}

	public async updateFarm(farm: Farm, id: string): Promise<Object[] | Object | unknown> {
		try {
			if ((farm.cropArea + farm.vegetableArea) > farm.totalArea) {
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid area"
				});
			}

			await validateOrReject(farm, { skipMissingProperties: true });
			await this.repo.updateFarm(farm, parseInt(id));
			return;
		} catch (errors) {
			throw errors;
		}
	}


	public async createCrop(crop: Crop): Promise<Object[] | Object | unknown> {
		try {
			await validateOrReject(crop);
			await this.repo.insertCrop(crop);
			return;
		} catch (errors: any) {
			if (errors.length > 0 && errors[0] instanceof ValidationError) {
				throw new AppError({
					httpCode: HttpCode.BAD_REQUEST,
					description: "invalid area"
				});
			}
			throw errors;
		}
	}

	public async updateCrop(crop: Crop, id: string): Promise<Object[] | Object | unknown> {
		try {
			await validateOrReject(crop, { skipMissingProperties: true });
			await this.repo.updateCrop(crop, parseInt(id));
			return;
		} catch (errors) {
			console.log(errors)
			throw errors;
		}
	}

	public async bindCrops(cropId: string, crops: Crop[]): Promise<Object[] | Object | unknown> {
		try {
			await this.repo.bindCrops(parseInt(cropId), crops);
			return;
		} catch (errors) {
			throw errors;
		}
	}

	public async buildReport(): Promise<Object[] | Object | unknown> {
		try {
			const totalCount = await this.repo.selectTotalAreaCount({ totalArea: MoreThan(0) });
			const vegetableTotal = await this.repo.selectTotalVegetable({ vegetableArea: MoreThan(0) });
			const cropTotal = await this.repo.selectTotalCrop({ cropArea: MoreThan(0) });

			const areabyState = await this.repo.selectTotalby('state', 'total_area');
			const vegetablebyState = await this.repo.selectTotalby('state', 'vegetable_area');
			const cropsbyState = await this.repo.selectTotalby('state', 'crop_area');

			const areabyCrop = await this.repo.selectAreaByCrop();
			
			return {totalCount, vegetableTotal, cropTotal, areabyState, vegetablebyState, cropsbyState, areabyCrop};
		} catch (errors) {
			throw errors;
		}
	}

}



export default function NewService(repo: Repo): Service {
	return new AgroService(repo);
}

