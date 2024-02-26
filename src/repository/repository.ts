import {AppError, HttpCode} from "../errorHandler";
import { Repo } from "../service/service"
import PGRepository from "./postgres/postgres";

export default function NewRepo(connectionString: string | undefined): Repo | undefined {
	if (!connectionString){
		throw new Error("connection uri not defined!")
	}

	let url = new URL(connectionString);
	switch (url.protocol) {
		case 'postgres:':
			return new PGRepository(url);
		default:
			break;
	}
}

