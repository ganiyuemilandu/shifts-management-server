import type { OrderItem } from "sequelize";
import { z } from "zod";
import type { PaginationQuery } from "##/@types/index.js";
import type { UserAttributes } from "##/models/user";

export const profile = z.object({
	firstName: z.string().trim().nonempty("First name is required").regex(/^[A-Za-z]+$/, "First name must contain only letters"),
	lastName: z.string().trim().nonempty("Last name is required").regex(/^[A-Za-z]+$/, "Last name must contain only letters"),
	role: z.enum(["admin", "staff"], "Role must be either admin or staff").optional(),
	email: z.string().trim().nonempty("Email is required").email("Email must be a valid email address"),
	password: z.string().trim().nonempty("Password is required").min(8, "Password must be at least 8 characters long")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/, "Password must contain at least one number")
});

export type ProfileProps = z.infer<typeof profile>;

export const querySchema = z.object({
	firstName: z.string().trim().nonempty().optional().catch(undefined).transform((firstName) => {
		return firstName && { firstName };
	}),
	lastName: z.string().trim().nonempty().optional().catch(undefined).transform((lastName) => {
		return lastName && { lastName };
	}),
	role: z.enum(["admin", "staff"]).optional().catch(undefined).transform((role) => {
		return role && { role };
	}),
	order: z.preprocess((order?: string | [string, string]): string[] => {
		if (!order)
			return ["id", "ASC"];
		if (Array.isArray(order))
			return [order[0].trim().toLowerCase(), order[1].trim().toUpperCase()];
		return [order.trim().toLowerCase(), order.trim().toUpperCase()];
	}, z.tuple([
		z.enum(["id", "firstname", "lastname", "email"]).catch("id"),
		z.enum(["ASC", "DESC"]).catch("ASC")
	]).transform((order) => (order[0] === "id" ? [order] : [order, ["id", "ASC"]]) as OrderItem[])),
	limit: z.coerce.number().int().min(1).max(20).catch(10),
	cursor: z.string().trim().optional(),
	scroll: z.preprocess((scroll?: string) => scroll ? scroll.trim().toLowerCase() : "next", z.enum(["prev", "next"]).catch("next"))
}).transform(({ firstName, lastName, role, ...rest }): PaginationQuery<UserAttributes> => {
	const queryOptions: PaginationQuery<UserAttributes> = rest;
	if (firstName || lastName || role)
		queryOptions.where = Object.assign({}, firstName, lastName, role) as UserAttributes;
	return queryOptions;
});


export const credentials = profile.pick({ email: true, password: true });

export type CredentialsProps = z.infer<typeof credentials>;