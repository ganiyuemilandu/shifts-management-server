import { type FindOptions, Op, type WhereOptions } from "sequelize";
import type { Pagination } from "##/@types/index.js";


export const Paginate = async <T>(
	cursor: unknown,
	options: FindOptions<T>,
	findAll: (options: FindOptions<T>) => Promise<T[]>,
	findOne: (options: FindOptions<T>) => Promise<T | null>,
	scroll: "prev" | "next" = "next"
): Promise<Pagination<T>> => {
	options.limit = options.limit ? options.limit + 1 : 11;
	const [[field, order]] = options.order as [[keyof WhereOptions<T>, "ASC" | "DESC"]];
		options.where && delete options.where[field];
		const value = field === "id" ? parseInt(cursor as string) || 0 : cursor || null;
	if (scroll === "prev") {
		const [comparator, reverseComparator] = order === "ASC" ? [Op.lt, Op.gte] : [Op.gt, Op.lte];
		if (value !== null)
			options.where = Object.assign({ [field]: { [comparator]: value } }, options.where);
		(options.order as [[string, unknown]])[0] = [field, order === "ASC" ? "DESC" : "ASC"];
		const [page, next] = await Promise.all([findAll(options), findOne({ where: { [field]: { [reverseComparator]: value } } })]);
		return {
			page: page.slice(0, options.limit - 1).reverse(),
			hasPrev: page.length === options.limit,
			hasNext: next !== null
		}
	}
	const [comparator, reverseComparator] = order === "ASC" ? [Op.gt, Op.lte] : [Op.lt, Op.gte];
	if (value !== null)
		options.where = Object.assign({ [field]: { [comparator]: value } }, options.where);
		const [page, prev] = await Promise.all([findAll(options), findOne({ where: { [field]: { [reverseComparator]: value } } })]);
		return {
			page: page.slice(0, options.limit - 1),
			hasPrev: prev !== null,
			hasNext: page.length === options.limit,
		}
};


/*
const searchFor = <T> (obj: Record<string, unknown>, comparator: symbol, current?: WhereOptions<T>) => {
	const currentCopy = Object.assign({}, current) as Record<string, unknown>;
	for (const [key, val] of Object.entries(obj))
		currentCopy[key] = { [comparator]: val };
	return currentCopy as WhereOptions<T>;
};


const sortBy = (obj: Record<string, unknown>, order: "ASC" | "DESC", current?: Order) => {
	const objCopy = Object.assign({}, obj);
	for (const key of Object.keys(objCopy))
		objCopy[key] = order
	for (const [key, val] of (current || []) as [[string, unknown]]) {
		if (!objCopy[key])
			objCopy[key] = val;
	}
	if (!objCopy["id"])
		objCopy["id"] = "ASC";
	return Object.entries(objCopy) as Order;
};
*/