import type { Request, Response as EResponse } from "express";
import { Op } from "sequelize";

import type { HTTPOkResponse, Pagination } from "##/@types/index.js";
import Shift, { type ShiftAttributes } from "##/models/shift";
import Staff from "##/models/user";
import { querySchema } from "##/schemas/shift";
import { HTTPError } from "##/utils/index";
import { Paginate } from "../index.js";


type Response = EResponse<HTTPOkResponse<ShiftAttributes | Pagination<ShiftAttributes> | null>>;

export const assignShift = async (req: Request, res: Response) => {
	const [staffId = 0, shiftId = 0] = [parseInt(req.params["staffId"] as string), parseInt(req.params["shiftId"] as string)];
	const [staff, shift] = await Promise.all([
		Staff.findByPk(staffId),
		Shift.findByPk(shiftId)
	]);
	if (!staff)
		throw new HTTPError("Resource Not Found!", 404);
	shift && await staff.addShift(shift);
	const [assignment = null] = !shift? []: await staff.getShifts({ where: { id: shiftId } });
	res.status(201).json({ data: assignment });
};


export const unassignShift = async (req: Request, res: Response) => {
	const [staffId = 0, shiftId = 0] = [parseInt(req.params["staffId"] as string), parseInt(req.params["shiftId"] as string)];
	const staff = await Staff.findByPk(staffId);
	if (!staff)
		throw new HTTPError("Resource Not Found!", 404);
	const [assignment = null] = await staff.getShifts({ where: { id: shiftId } });
	await staff.removeShift(shiftId);
	res.status(200).json({ data: assignment });
};


export const getShifts = async (req: Request, res: Response) => {
	const staffId = parseInt(req.params["staffId"] as string) || 0;
	if (!req.user!.isSelf(staffId) && !req.user!.isAdmin())
		throw new HTTPError("Access denied", 403);
	const staff = await Staff.findByPk(staffId);
	if (!staff)
		throw new HTTPError("Resource Not Found!", 404);
	const { cursor, scroll, ...query } = querySchema.parse(req.query);
	const findAll = (options: typeof query) => staff.getShifts(options);
	const findOne = (options: typeof query) => staff.getShifts({ ...options, limit: 1 }).then(([shift=null]) => shift);
	const page = await Paginate(cursor, query, findAll, findOne, scroll);
	res.status(200).json({ data: page });
};


export const getShift = async (req: Request, res: Response) => {
	const [staffId = 0, shiftId = 0] = [parseInt(req.params["staffId"] as string), parseInt(req.params["shiftId"] as string)];
	if (!req.user!.isSelf(staffId) && !req.user!.isAdmin())
		throw new HTTPError("Access denied", 403);
	const staff = await Staff.findByPk(staffId);
	if (!staff)
		throw new HTTPError("Resource Not Found!", 404);
	const now = new Date();
	const [assignment = null] = await staff.getShifts(shiftId? {
		where: { id: shiftId },
	}: {
		where: { [Op.or]: [{
			start: { [Op.gte]: now }
		}, {
			start: { [Op.lt]: now },
			end: { [Op.gte]: now }
		}] },
		order: [["start", "ASC"]],
		limit: 1
	});
	res.status(200).json({ data: assignment });
};


export const updateShift = async (req: Request, res: Response) => {
	const [staffId = 0, shiftId = 0] = [parseInt(req.params["staffId"] as string), parseInt(req.params["shiftId"] as string)];
	if (!req.user!.isSelf(staffId))
		throw new HTTPError("Access denied", 403);
	const [staff, shift] = await Promise.all([Staff.findByPk(staffId), Shift.findByPk(shiftId)]);
	if (!staff || !shift)
		throw new HTTPError("Resource Not Found!", 404);
	await staff.addShift(shift, { through: req.body });
	const [assignment] = await staff.getShifts({ where: { id: shiftId } });
	res.status(200).json({ data: assignment! });
};