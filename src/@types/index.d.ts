import type { FindOptions } from "sequelize";

export type HTTPErrorResponse<T=void> = {
	error: T extends void? {
		readonly name: string,
		readonly message: string
	}: {
		readonly name: string,
		readonly message: string,
		readonly issues: T
	}
};

export type HTTPOkResponse<T=void> = {
	readonly data: T extends void? null: T
};

export type Pagination<T> = {
	readonly page: T[],
	readonly hasNext: boolean,
	readonly hasPrev: boolean
};

export interface PaginationQuery<T> extends FindOptions<T> {
	cursor?: unknown,
	scroll?: "prev" | "next"
};