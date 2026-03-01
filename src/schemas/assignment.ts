import { z } from "zod";

export const staffOrShiftIds = z.array(z.int(), "Must be an array of integers");

export const assignment = z.object({
	status: z.enum(["accepted", "declined"]).optional(),
	clockedIn: z.coerce.date().optional(),
	clockedOut: z.coerce.date().optional(),
	breakStart: z.coerce.date().optional(),
	breakEnd: z.coerce.date().optional(),
	declineNote: z.string().trim().nonempty().nullable().optional()
});

export type AssignmentProps = z.infer<typeof assignment>;