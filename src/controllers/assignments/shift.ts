import type { Request, Response as EResponse } from "express";
import { Op } from "sequelize";

import type { HTTPOkResponse, Pagination } from "##/@types/index.js";
import Shift from "##/models/shift";
import Staff, { type UserAttributes } from "##/models/user";
import { querySchema } from "##/schemas/user";
import { HTTPError } from "##/utils/index";
import { Paginate } from "../index.js";


type Response = EResponse<HTTPOkResponse<UserAttributes | Pagination<UserAttributes> | null>>;

export const assignStaff = async (req: Request, res: Response) => {
	const [shiftId = 0, staffId = 0] = [parseInt(req.params["shiftId"] as string), parseInt(req.params["staffId"] as string)];
	const [shift, staff] = await Promise.all([
		Shift.findByPk(shiftId),
		Staff.findByPk(staffId)
	]);
	if (!shift)
		throw new HTTPError("Resource Not Found!", 404);
	staff && await shift.addStaff(staff);
	const [assignment = null] = !staff? []: await shift.getStaffs({ where: { id: staffId } });
	res.status(201).json({ data: assignment });
};


export const unassignStaff = async (req: Request, res: Response) => {
	const [shiftId = 0, staffId = 0] = [parseInt(req.params["shiftId"] as string), parseInt(req.params["staffId"] as string)];
	const shift = await Shift.findByPk(shiftId);
	if (!shift)
		throw new HTTPError("Resource Not Found!", 404);2
	const [assignment = null] = await shift.getStaffs({ where: { id: staffId } });
	await shift.removeStaff(staffId);
	res.status(200).json({ data: assignment });
};


export const getStaffs = async (req: Request, res: Response) => {
	const shiftId = parseInt(req.params["shiftId"] as string) || 0;
	const shift = await Shift.findByPk(shiftId);
	if (!shift)
		throw new HTTPError("Resource Not Found!", 404);
	const { cursor, scroll, ...query } = querySchema.parse(req.query);
	const id = req.user!.isAdmin() ? parseInt(req.query["id"] as string) : req.user!.id;
	if (id)
		query.where = query.where ? { ...query.where, id }: { id };
	const findAll = (options: typeof query) => shift.getStaffs(options);
	const findOne = (options: typeof query) => shift.getStaffs({ ...options, limit: 1 }).then(([staff=null]) => staff);
	const page = await Paginate(cursor, query, findAll, findOne, scroll);
	res.status(200).json({ data: page });
};


export const getStaff = async (req: Request, res: Response) => {
	const [shiftId = 0, staffId = 0] = [parseInt(req.params["shiftId"] as string), parseInt(req.params["staffId"] as string)];
	if (!req.user!.isSelf(staffId) && !req.user!.isAdmin())
		throw new HTTPError("Access denied", 403);
	const shift = await (
		shiftId ? Shift.findByPk(shiftId) : Staff.findByPk(staffId).then(async (staff) => {
			if (!staff)
				return null;
			const now = new Date();
			const shifts = await staff.getShifts({
				where: { [Op.or]: [{
					start: { [Op.gte]: now }
				}, {
					start: { [Op.lt]: now },
					end: { [Op.gte]: now }
				}] },
				order: [["start", "ASC"]],
				limit: 1
			});
			return shifts[0];
		})
	);
	if (shift === null)
		throw new HTTPError("Resource Not Found!", 404);
	const [assignment = null] = !shift? []: await shift.getStaffs({ where: { id: staffId } });
	res.status(200).json({ data: assignment });
};


export const updateStaff = async (req: Request, res: Response) => {
	const [shiftId, staffId] = [parseInt(req.params["shiftId"] as string) || 0, parseInt(req.params["staffId"] as string) || 0];
	if (!req.user!.isSelf(staffId))
		throw new HTTPError("Access denied", 403);
	const [shift, staff] = await Promise.all([Shift.findByPk(shiftId), Staff.findByPk(staffId)]);
	if (!shift || !staff)
		throw new HTTPError("Resource Not Found!", 404);
	await shift.addStaff(staff, { through: req.body });
	const [assignment] = await shift.getStaffs({ where: { id: staffId } });
	res.status(200).json({ data: assignment! });
};