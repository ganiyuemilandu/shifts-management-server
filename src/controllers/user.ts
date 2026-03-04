import type { NextFunction, Request, Response as EResponse } from "express";
import { UniqueConstraintError } from "sequelize";

import type { HTTPOkResponse, Pagination } from "##/@types/index.js";
import { redisClient } from "##/databases/redis";
import User, { type UserAttributes } from "##/models/user";
import { querySchema } from "##/schemas/user";
import { HTTPError } from "##/utils/index";
import { Paginate } from "./index.js";


type SafeUserAttributes = Omit<UserAttributes, "password">;
type Response = EResponse<HTTPOkResponse<SafeUserAttributes | Pagination<SafeUserAttributes>>>;

export const create = async (req: Request, res: Response) => {
	try {
		const user = await User.create(req.body);
		res.status(201).json({ data: user });
	} catch (error) {
		if (error instanceof UniqueConstraintError)
			throw new HTTPError("Email already in use", 400);
		throw error;
	}
};


export const findOne = async (req: Request, res: Response) => {
	const id = Number.parseInt(req.params["id"]! as string) || 0;
	if (!req.user!.isSelf(id) && !req.user!.isAdmin())
		throw new HTTPError("Access denied", 403);
	const user = await User.findByPk(id);
	if (!user)
		throw new HTTPError("Resource Not Found!", 404);
	res.status(200).json({ data: user });
};


export const findAll = async (req: Request, res: Response) => {
	const { cursor, scroll, ...query } = querySchema.parse(req.query);
	const findAll = (options: typeof query) => User.findAll(options);
	const findOne = (options: typeof query) => User.findOne(options);
	const page = await Paginate(cursor, query, findAll, findOne, scroll);
	res.status(200).json({ data: page });
};


export const update = async (req: Request, res: Response) => {
	try {
		const id = Number.parseInt(req.params["id"]! as string) || 0;
	if (!req.user!.isSelf(id) && !req.user!.isAdmin())
		throw new HTTPError("Access denied", 403);
		const user = await User.findByPk(id);
		if (!user)
			throw new HTTPError("Resource Not Found!", 404);
		const { role, ...rest } = req.body;
		const entries = Object.entries(rest) as ([keyof UserAttributes, never])[];
		entries.forEach(([key, val]) => user[key] = val);
		user.role = (!role || req.user!.isSelf(id))? user.role: role;
		await user.save();
		if (user.isSelf(id))
			await redisClient.set(`user:${id}:profile`, user.toString(), { KEEPTTL: true });
		res.status(200).json({ data: user });
	} catch (error) {
		if (error instanceof UniqueConstraintError)
			throw new HTTPError("Email already in use", 400);
		throw error;
	}
};


export const destroy = async (req: Request, res: Response, next: NextFunction) => {
	const id = Number.parseInt(req.params["id"]! as string) || 0;
	if (!req.user!.isSelf(id) && !req.user!.isAdmin())
		throw new HTTPError("Access denied", 403);
	const user = await User.findByPk(id);
	if (!user)
		throw new HTTPError("Resource Not Found!", 404);
	await user.destroy();
	if (req.user!.isSelf(id))
		next();
	else
		res.status(200).json({ data: user });
};