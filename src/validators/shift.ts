import { shift } from "@/schemas/shift.js";
import { validationHandler } from "@/utils/middleware.js";


export const create = validationHandler((body) => shift.parse(body));

export const update = validationHandler((body) => shift.partial().parse(body));