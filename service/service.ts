import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, Unique, BeforeInsert, BeforeUpdate } from "typeorm"
import { IsNotEmpty, IsOptional, Length, Matches, MaxLength } from "class-validator"
import IsCpfValid, { IsCnpjValid } from "./customValidators";
import {PickKeysByType} from "typeorm/common/PickKeysByType";

@Entity({ name: "farmer"})
export class Farmer extends BaseEntity {
	@PrimaryGeneratedColumn()
	readonly id: number;
	
	@Column({length: 700})
	@IsNotEmpty()
	name: string

	@Column({unique: true})
	@IsNotEmpty()
	@IsCpfValid()
	cpf: string

	@Column()
	@IsCnpjValid()
	@IsNotEmpty()
	cnpj: string
	
	@Column({length: 700})
	@IsNotEmpty()
	city: string

	@Column({length: 700})
	@IsNotEmpty()
	state: string

	@ManyToMany((type) => Farm, (farm) => farm.farmers, { cascade: true, onDelete: "CASCADE" })
	@JoinTable()
	farms: Farm[]

	@CreateDateColumn({name: "created_at"})
	createdAt: Date;

	@UpdateDateColumn({name: "updated_at"})
	updatedAt: Date;

	@BeforeInsert()
    @BeforeUpdate()
    sanitizeCPF() {
        // Remove any non-numeric characters from the CPF
        if (this.cpf) {
            this.cpf = this.cpf.replace(/\D/g, '');
        }
    }

	@BeforeInsert()
    @BeforeUpdate()
    sanitizeCNPJ() {
        // Remove any non-numeric characters from the CPF
        if (this.cnpj) {
            this.cnpj = this.cnpj.replace(/\D/g, '');
        }
    }
}

@Entity({ name: "farm"})
export class Farm extends BaseEntity {
	@PrimaryGeneratedColumn()
	readonly id: number;
	
	@Column({length: 700})
	@IsNotEmpty()
	name: string
	
	@Column({length: 700})
	@IsNotEmpty()
	city: string

	@Column({length: 700})
	@IsNotEmpty()
	state: string

	@Column({type: "integer", name: 'total_area'})
	@IsNotEmpty()
	totalArea: number

	@Column({type: "integer", name: "crop_area"})
	@IsNotEmpty()
	cropArea: number

	@Column({type: "integer", name: "vegetable_area"})
	@IsNotEmpty()
	vegetableArea: number

	@ManyToMany((type) => Farmer, (farmer) => farmer.farms)
	farmers: Farmer[]
	
	@ManyToMany((type) => Crop, (crop) => crop.farms, { cascade: true, onDelete: "CASCADE"  })
	@JoinTable()
	crops: Crop[]

	@CreateDateColumn({name: "created_at"})
	createdAt: Date;

	@UpdateDateColumn({name: "updated_at"})
	updatedAt: Date;
}

@Entity({ name: "crop"})
export class Crop extends BaseEntity {
	@PrimaryGeneratedColumn()
	readonly id: number;

	@Column()
	@IsNotEmpty()
	@MaxLength(300)
	name: string

	@ManyToMany((type) => Farm, (farm) => farm.crops)
	farms: Farm[]

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}

// All Storage Methods (for visualization)
export interface Repo {
	insertFarmer(farmer: Farmer): Promise<Object | Object[] | unknown>;
	updateFarmer(farmer: Farmer, id: number): Promise<Object | Object[] | unknown>;
	deleteFarmer(id: number): Promise<Object | Object[] | unknown>
	bindFarms(farmerId: number, farms: Farm[]): Promise<Object | Object[] | unknown>;

	insertFarm(farm: Farm): Promise<Object | Object[] | unknown>;
	updateFarm(farm: Farm, id: number): Promise<Object | Object[] | unknown>;

	insertCrop(crop: Crop): Promise<Object[] | Object | unknown>;
	updateCrop(crop: Crop, id: number): Promise<Object | Object[] | unknown>;
	bindCrops(farmId: number, crops: Crop[]): Promise<Object | Object[] | unknown>;

	selectTotalAreaCount(where: object): Promise<Object | Object[] | unknown>
	selectTotalCrop(where: object): Promise<Object | Object[] | unknown>
	selectTotalVegetable(where: object): Promise<Object | Object[] | unknown>
	selectTotalby(byColumn:string, selectColumn:string): Promise<Object | Object[] | unknown>
	selectAreaByCrop(): Promise<Object | Object[] | unknown>
}

// All Bussines Rules (for visualization)
export interface Service {
	createFarmer(farmer: Farmer): Promise<Object[] | Object | unknown>;
	updateFarmer(farmer: Farmer, id: string): Promise<Object | Object[] | unknown>;
	removeFarmer(id: string): Promise<Object | Object[] | unknown>

	bindFarms(farmerId: string, farms: Farm[]): Promise<Object | Object[] | unknown>;
	createFarm(farm: Farm): Promise<Object | Object[] | unknown>;
	updateFarm(farm: Farm, id: string): Promise<Object | Object[] | unknown>;

	createCrop(crop: Crop): Promise<Object[] | Object | unknown>;
	updateCrop(crop: Crop, id: string): Promise<Object | Object[] | unknown>;
	bindCrops(farmId: string, crops: Crop[]): Promise<Object | Object[] | unknown>;

	buildReport(): Promise<Object | Object[] | unknown>
}

