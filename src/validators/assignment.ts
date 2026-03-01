import { assignment, staffOrShiftIds } from "@/schemas/assignment.js";
import { validationHandler } from "@/utils/middleware.js";

export const assign = validationHandler((body) => staffOrShiftIds.parse(body));

export const update = validationHandler((body) => assignment.parse(body));