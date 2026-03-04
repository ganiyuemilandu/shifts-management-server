import type { Request, Response as EResponse } from "express";
import { UniqueConstraintError } from "sequelize";

import type { HTTPOkResponse, Pagination } from "##/@types/index.js";
import Shift, { type ShiftAttributes } from "##/models/shift";
import { querySchema } from "##/schemas/shift";
import { HTTPError } from "##/utils/index";
import { Paginate } from "./index.js";


type Response = EResponse<HTTPOkResponse<ShiftAttributes | Pagination<ShiftAttributes>>>;



export const create = async (req: Request, res: Response) => {
	try {
		const shift = await Shift.create(req.body);
		res.status(201).json({ data: shift });
	} catch (error) {
		if (error instanceof UniqueConstraintError)
			throw new HTTPError("Shift already scheduled!", 400);
		throw error;
	}
};


export const findOne = async (req: Request, res: Response) => {
	const id = Number.parseInt(req.params["id"]! as string) || 0;
	const shift = id && await Shift.findByPk(id);
	if (!shift)
		throw new HTTPError("Resource Not Found!", 404);
	res.status(200).json({ data: shift });
};


export const findAll = async (req: Request, res: Response) => {
	const { cursor, scroll, ...query } = querySchema.parse(req.query);
	const findAll = (options: typeof query) => Shift.findAll(options);
	const findOne = (options: typeof query) => Shift.findOne(options);
	const page = await Paginate(cursor, query, findAll, findOne, scroll);
	res.status(200).json({ data: page });
}


export const update = async (req: Request, res: Response) => {
	const id = Number.parseInt(req.params["id"]! as string) || 0;
	const shift = id && await Shift.findByPk(id);
	if (!shift)
		throw new HTTPError("Resource Not Found!", 404);
	const entries = Object.entries(req.body) as ([keyof ShiftAttributes, never])[];
	entries.forEach(([key, val]) => shift[key] = val);
	await shift.save();
	res.status(200).json({ data: shift });
};


export const destroy = async (req: Request, res: Response) => {
	const id = Number.parseInt(req.params["id"]! as string) || 0;
	const shift = id && await Shift.findByPk(id);
	if (!shift)
		throw new HTTPError("Resource Not Found!", 404);
	await shift.destroy();
	res.status(200).json({ data: shift });
};