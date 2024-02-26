import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, Unique, BeforeInsert, BeforeUpdate } from "typeorm"
import { IsNotEmpty, MaxLength, ValidateIf,IsUUID, IsNumber, IsString } from "class-validator"
import IsCpfValid, {IsCnpjValid} from "./customValidators";

@Entity({ name: "user"})
export class User extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;
	
	@Column({length: 700})
	@IsNotEmpty()
	@IsString()
	name: string;

	@Column({length: 700})
	@IsNotEmpty()
	@IsString()
	username: string;

	@Column({length: 700})
	@IsNotEmpty()
	@IsString()
	password: string;
	
	@CreateDateColumn({name: "created_at"})
	createdAt: Date;

	@UpdateDateColumn({name: "updated_at"})
	updatedAt: Date;
}

@Entity({ name: "farmer"})
export class Farmer extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;
	
	@Column({length: 700})
	@IsNotEmpty()
	@IsString()
	name: string

	@Column({unique: true, nullable: true})
	@ValidateIf((f:Farmer) => !f.cnpj)
	@IsCpfValid()
	cpf: string

	@Column({unique: true, nullable: true})
	@ValidateIf((f:Farmer) => !f.cpf)
	@IsCnpjValid()
	cnpj: string
	
	@Column({length: 700})
	@IsNotEmpty()
	@IsString()
	city: string

	@Column({length: 700})
	@IsNotEmpty()
	@IsString()
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
        if (this.cpf) { this.cpf = this.cpf.replace(/\D/g, '') }
    }

    @BeforeInsert()
    @BeforeUpdate()
    sanitizeCNPJ() {
        if (this.cnpj) { this.cnpj= this.cnpj.replace(/\D/g, '') }
    }
}

@Entity({ name: "farm"})
export class Farm extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;
	
	@Column({length: 700})
	@IsNotEmpty()
	@IsString()
	name: string
	
	@Column({length: 700})
	@IsNotEmpty()
	city: string

	@Column({length: 700})
	@IsNotEmpty()
	state: string

	@Column({type: "integer", name: 'total_area'})
	@IsNotEmpty()
	@IsNumber()
	totalArea: number

	@Column({type: "integer", name: "crop_area"})
	@IsNotEmpty()
	@IsNumber()
	cropArea: number

	@Column({type: "integer", name: "vegetable_area"})
	@IsNotEmpty()
	@IsNumber()
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
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	@IsNotEmpty()
	@MaxLength(300)
	@IsString()
	name: string

	@ManyToMany((type) => Farm, (farm) => farm.crops)
	farms: Farm[]

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}

export type Dashboard = {
	total: object;
	vegetableTotal: number | null;
	cropTotal: number | null;
	areabyState: object[];
	vegetablebyState: object[];
	cropsbyState: object[];
	areabyCrop: object[];
}

// All Storage Methods
interface UserRepo {
	searchUser(id: string): Promise<User | null>;
	insertUser(user: User): Promise<void>;
}

interface FarmerRepo {
	insertFarmer(farmers: Farmer[]): Promise<void>;
	updateFarmer(farmer: Farmer, id: string): Promise<void>;
	deleteFarmer(id: string): Promise<void>
	bindFarms(farmerId: string, farms: Farm[]): Promise<void>;
}

interface FarmRepo {
	insertFarm(farms: Farm[]): Promise<void>;
	updateFarm(farm: Farm, id: string): Promise<void>;
	searchFarm(id: string): Promise<Farm | null>;
}

interface CropRepo{
	insertCrop(crops: Crop[]): Promise<void>;
	updateCrop(crop: Crop, id: string): Promise<void>;
	bindCrops(farmId: string, crops: Crop[]): Promise<void>;
}

interface DashRepo {
	selectTotalAreaCount(where: object): Promise<object>;
	selectTotalCrop(where: object): Promise<number | null>;
	selectTotalVegetable(where: object): Promise<number | null>;
	selectTotalby(byColumn:string, selectColumn:string): Promise<object[]>;
	selectAreaByCrop(): Promise<object[]>;
}

export interface Repo extends UserRepo, FarmerRepo, FarmRepo, CropRepo, DashRepo {}

// All Bussines Rules 
export interface Service {
	registerUser(user: User): Promise<void>;
	loginUser(user: User): Promise<string|void>;

	createFarmer(farmers: Farmer[]): Promise<Object[] | Object | unknown>;
	updateFarmer(farmer: Farmer, id: string): Promise<Object | Object[] | unknown>;
	removeFarmer(id: string): Promise<Object | Object[] | unknown>

	bindFarms(farmerId: string, farms: Farm[]): Promise<Object | Object[] | unknown>;
	createFarm(farms: Farm[]): Promise<Object | Object[] | unknown>;
	updateFarm(farm: Farm, id: string): Promise<Object | Object[] | unknown>;

	createCrop(crops: Crop[]): Promise<Object[] | Object | unknown>;
	updateCrop(crop: Crop, id: string): Promise<Object | Object[] | unknown>;
	bindCrops(farmId: string, crops: Crop[]): Promise<Object | Object[] | unknown>;

	buildReport(): Promise<Object | Object[] | unknown>
}

