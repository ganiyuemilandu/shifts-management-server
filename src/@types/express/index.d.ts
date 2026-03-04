import { type Request } from "express";
import type User from "##/models/user";

declare module "express-serve-static-core" {
	export interface Request {
		user?: User;
	}
};