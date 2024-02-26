import dotenv from 'dotenv';
import NewApp from './http/express';
import logger from './logger';
import NewRepo from './repository/repository'
import NewService from './service/agro'

try {
	// Init env
	dotenv.config()
	process.env.URI_DB = process.env.URI_DB || "postgres://user:password@localhost/agro-db"
	process.env.PORT = process.env.PORT || "3000"

	// Repository Layer
	let repo = NewRepo(process.env.URI_DB);
	if (repo === undefined) {
		throw Error("Could not initialize repository")
	}

	// Service Layer
	let svc = NewService(repo);
	if (svc == undefined) {
		throw Error("Could not initialize service")
	}

	// HTTP Layer
	let app = NewApp(svc);
} catch (error) {
	logger.error('Application encountered a critical error. Exiting');
	process.exit(1);
}

