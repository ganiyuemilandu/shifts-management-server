import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import type { NextFunction, Request, Response } from "express";

import authRouter from "@/routes/auth.js";
import shiftAssignmentRouter from "@/routes/assignments/shift.js";
import staffAssignmentRouter from "@/routes/assignments/staff.js";
import shiftRouter from "@/routes/shift.js";
import userRouter from "@/routes/user.js";

import { port } from "@/utils/config.js";
import { HTTPError } from "@/utils/index.js";
import type { HTTPErrorResponse } from "@/@types/index.js";


const app = express();

app.set("port", port);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({ origin: process.env["CLIENT_DOMAIN"], credentials: true }));

app.get("/", async (_req: Request, res: Response) => {
	res.status(200).json({ message: "Hello, user!" });
});

const baseUrl = "/api/v1";
app.use(baseUrl + "/assignments/shift", shiftAssignmentRouter);
app.use(baseUrl + "/assignments/staff", staffAssignmentRouter);
app.use(baseUrl + "/auth", authRouter);
app.use(baseUrl + "/shifts", shiftRouter);
app.use(baseUrl + "/users", userRouter);

app.use((err: unknown, _req: Request, res: Response<HTTPErrorResponse>, _next: NextFunction) => {
	if (err instanceof HTTPError)
		return res.status(err.status).json(err as unknown as HTTPErrorResponse);
	console.error(err);
	return res.status(500).json({
		error: {
			name: "ServerError",
			message: "An unexpected error occurred"
		}
	});
});

export default app;