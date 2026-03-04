import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import type { HTTPErrorResponse } from "##/@types/index.js";
import User from "##/models/user";
import { HTTPError } from "./index.js";


export function validationHandler(validate: (data: unknown) => unknown, location: "body" | "query" = "body") {
	type Issues = Record<string, string>;
	return async (req: Request, res: Response<HTTPErrorResponse<Issues>>, next: NextFunction) => {
		try 	{
			const result = validate(req[location]);
			const body = (result instanceof Promise)? await result: result;	
			req.body = body;
			next();
		} catch (err) {
			console.error(err);
			const issues = (err as ZodError).issues.reduce((acc: Issues, val) => {
				acc[val.path[0] as string] = val.message;
				return acc;
			}, {});
			res.status(400).json({
				error: {
					name: "ValidationError",
					message: "Missing and/or incorrect fields",
					issues
				}
			});
		}
	};
};


export const userAuthHandler = async (req: Request, _res: Response, next: NextFunction) => {
	const { authorization="" } = req.headers;
	req.user = await User.parse(authorization.substring(7), "ACCESS");
	next();
};


export const adminAuthHandler = async (req: Request, _res: Response, next: NextFunction) => {
	const { authorization="" } = req.headers;
	const user = await User.parse(authorization.substring(7), "ACCESS");
	if (!user.isAdmin())
		throw new HTTPError("Forbidden: Require admin privileges", 403);
	req.user = user;
	next();
};