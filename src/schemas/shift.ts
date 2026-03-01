import { Op, type OrderItem } from "sequelize";
import { z } from "zod";

import type { PaginationQuery } from "@/@types/index.js";
import type { ShiftAttributes } from "@/models/shift.js";

export const shift = z.object({
	title: z.string().trim().nonempty("Title is required"),
	location: z.string().trim().nonempty("Location is required"),
	start: z.coerce.date("Start time must be a valid date time"),
	end: z.coerce.date("End time must be a valid date time"),
	break: z.number().min(0, "Break duration cannot be negative").optional(),
	remark: z.string().trim().nonempty("Remark cannot be empty")
});

export const querySchema = z.object({
	start: z.coerce.date().optional().catch(undefined),
	end: z.coerce.date().optional().catch(undefined),
	order: z.preprocess((order?: string | [string, string]): string[] => {
		if (!order)
			return ["id", "ASC"];
		if (Array.isArray(order))
			return [order[0].trim().toLowerCase(), order[1].trim().toUpperCase()];
		return [order.trim().toLowerCase(), order.trim().toUpperCase()];
	}, z.tuple([
		z.enum(["id", "title", "location", "start"]).catch("id"),
		z.enum(["ASC", "DESC"]).catch("ASC")
	]).transform((order) => (order[0] === "id" ? [order] : [order, ["id", "ASC"]]) as OrderItem[])),
	limit: z.coerce.number().int().min(1).max(20).catch(10),
	cursor: z.string().trim().optional(),
	scroll: z.preprocess((scroll?: string) => scroll ? scroll.trim().toLowerCase() : "next", z.enum(["prev", "next"]).catch("next"))
}).transform(({ start, end, cursor, ...rest }): PaginationQuery<ShiftAttributes> => {
	const queryOptions: PaginationQuery<ShiftAttributes> = rest;
	queryOptions.cursor = (queryOptions.order as [[unknown, unknown]])[0][0] === "start" && cursor ? new Date(cursor) : cursor;
	if (start && end)
		queryOptions.where = { start: { [Op.between]: [start, end] } };
	else if (start || end)
		queryOptions.where = { start: { [start? Op.gte: Op.lte]: start || end } };
	return queryOptions;
});

export type ShiftProps = z.Infer<typeof shift>;