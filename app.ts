// app.js handles all constructors from other layers
//
// repo -> service -> http
//

import NewApp from './http/express';
import NewRepo from './repository/repository'
import NewService from './service/farmer'

// Repository Layer
let repo = NewRepo('postgres://root:root@localhost/agro-db');
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
