import { shift } from "##/schemas/shift";
import { validationHandler } from "##/utils/middleware";


export const create = validationHandler((body) => shift.parse(body));

export const update = validationHandler((body) => shift.partial().parse(body));