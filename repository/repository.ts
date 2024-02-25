import { Repo } from "../service/service"
import PGRepository from "./postgre/postgres";

export default function NewRepo(connectionString: string): Repo | undefined {
	let url = new URL(connectionString);
	switch (url.protocol) {
		case 'postgres:':
			return new PGRepository(url);
		default:
			break;
	}
}

