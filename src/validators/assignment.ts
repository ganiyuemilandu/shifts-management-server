import { assignment, staffOrShiftIds } from "##/schemas/assignment";
import { validationHandler } from "##/utils/middleware";

export const assign = validationHandler((body) => staffOrShiftIds.parse(body));

export const update = validationHandler((body) => assignment.parse(body));