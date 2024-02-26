import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Response, NextFunction} from 'express';
import { AppError, HttpCode } from "../../errorHandler";

export default async function hashPass(password:string){
	const salt = await bcrypt.genSalt(10);
	return await bcrypt.hash(password, salt)
}

export async function sign(username:string, data:string, encripted:string): Promise<string | void>{
	try {
		const isEqual = await bcrypt.compare(data, encripted);
		if (isEqual) {
			const privateKey = process.env.PRIVATE_KEY || "supersecret"
			return jwt.sign({username}, privateKey, {expiresIn: '10h'});
		}
	} catch (error) {
		throw new AppError({
			httpCode: HttpCode.BAD_REQUEST,
			description: "user not found"
		});
	}
}

class jwtMiddleware {
	public handleRequest(req: any, res: Response, next: NextFunction): void {
		const token = req.headers['authorization'];
		if (!token){
			throw new AppError({
				httpCode: HttpCode.UNAUTHORIZED,
				description: "invalid credentials"
			});
		}
		
		try {
			const decoded = jwt.verify(token as string, process.env.PRIVATE_KEY || "supersecret");
			req.user = decoded;
			next()
		} catch (error) {
			throw new AppError({
				httpCode: HttpCode.UNAUTHORIZED,
				description: "invalid credentials"
			});
		}
	}
}

export const jwtHandler = new jwtMiddleware();

