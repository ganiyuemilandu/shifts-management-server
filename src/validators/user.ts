import * as schema from "@/schemas/user.js";
import { validationHandler } from "@/utils/middleware.js";


export const register = validationHandler((body) => schema.profile.omit({ role: true }).parseAsync(body));

export const login = validationHandler((body) => schema.credentials.parse(body));

export const create = validationHandler((body) => schema.profile.parseAsync(body));

export const update = validationHandler((body) => schema.profile.partial().parseAsync(body));