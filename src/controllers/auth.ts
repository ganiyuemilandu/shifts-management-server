import type { Request, Response as EResponse, CookieOptions } from "express";
import { UniqueConstraintError } from "sequelize";

import type { HTTPOkResponse } from "@/@types/index.js";
import { redisClient } from "@/databases/redis.js";
import User, { type UserAttributes } from "@/models/user.js";
import { sendVerificationEmail } from "@/utils/email.js";
import { HTTPError } from "@/utils/index.js";


type AuthResponse = {
	token: string,
	user: Omit<UserAttributes, "password">
};

type Response = EResponse<HTTPOkResponse<AuthResponse | AuthResponse["user"] | null>>;


const cookieOptions: CookieOptions = {
	httpOnly: true,
	sameSite: "lax",
	//secure: process.env["NODE_ENV"] !== "development",
	maxAge: 60 * 60 * 24 * 1000,
	path: "/api/v1/auth"
};


export const register = async (req: Request, res: EResponse<HTTPOkResponse<ReturnType<typeof sendVerificationEmail>>>) => {
	const user = await User.create(req.body).catch(async (err) => {
		if (!(err instanceof UniqueConstraintError))
			throw err;
		const user = await User.unscoped().findOne({ where: { email: req.body.email, verified: false } });
		if (!user)
			throw new HTTPError("Email already in use", 400);
		return await user.update(req.body);
	});
	res.status(201).json({ data: sendVerificationEmail(user) });
};


export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body;
	const maxLoginAttempts = 10;
	const loginAttemptsKey = `user:${email}:loginAttempts`;
		const loginAttempts = parseInt(await redisClient.get(loginAttemptsKey) || "1");
	if (loginAttempts === maxLoginAttempts) {
		const pttl = await redisClient.pTTL(loginAttemptsKey);
		const hour = 60000 * 60;
		const msg = (pttl < hour)? `${Math.ceil(pttl / hour / 60)} minutes`: `${Math.ceil(pttl / hour)} hours`;
		throw new HTTPError(`Too many log in attempts. Try again in ${msg}`, 400);
	}
	const user = await User.findOne({ where: { email } });
	if (!user || !(await user.validatePassword(password))) {
		await (loginAttempts === 1? redisClient.set(loginAttemptsKey, 2, { PX: 60000 * 60 * 24 }): redisClient.incr(loginAttemptsKey));
		const logInAttemptsLeft = maxLoginAttempts - loginAttempts;
		throw new HTTPError(`Invalid credentials. ${logInAttemptsLeft} attempts left`, 400);
	}
	const [token] = await Promise.all([
		getToken(res, user),
		redisClient.del(loginAttemptsKey)
	]);
	res.status(200).json({ data: { token, user } });
};


export const logout = async (_req: Request, res: Response) => {
	res.clearCookie("refreshToken", cookieOptions);
	res.status(200).json({ data: null });
};


export const reset = async (req: Request, res: Response) => {
	const { email } = req.body;
	const user = email && await User.findOne({ where: { email } });
	if (!user)
		throw new HTTPError("User Not Found!", 404);
	res.status(200).json({ data: null });
};


export const verify = async (req: Request, res: Response) => {
	const { code } = req.body;
	const { authorization="" } = req.headers;
	if (typeof code !== "string" || !/^\d{6}$/.test(code))
		throw new HTTPError("Invalid verification code", 400);
	const attributes = await User.verifyToken(authorization.substring(7), code as "EMAIL") as UserAttributes | null;
	if (!attributes)
		throw new HTTPError("Unauthorized: Invalid token or code", 401);
	const user = await findUser(attributes.id || 0, attributes.verified || false);
	if (!user.verified) {
		user.verified = true;
		await user.save({ fields: ["verified"], silent: true });
	}
	const token = await getToken(res, user);
	res.status(200).json({ data: { token, user } });
};


export const send = async (req: Request, res: EResponse<HTTPOkResponse<ReturnType<typeof sendVerificationEmail>>>) => {
	const { authorization="" } = req.headers;
	const attributes = await User.verifyToken(authorization.substring(7), "EMAIL") as UserAttributes | null;
	if (!attributes)
		throw new HTTPError("Unauthorized: Invalid token", 401);
	const user = await findUser(attributes.id, attributes.verified);
	res.status(200).json({ data: sendVerificationEmail(user) });
};


export const refresh = async (req: Request, res: Response) => {
	const { refreshToken="" } = req.cookies;
	const user = await User.parse(refreshToken, "REFRESH");
	const token = await getToken(res, user);
	res.status(200).json({ data: { token, user } });
};


export const sign = async (req: Request, res: EResponse<HTTPOkResponse<string>>) => {
	const { refreshToken="" } = req.cookies;
	const payload = User.verifyToken(refreshToken, "REFRESH");
	if (!payload)
		throw new HTTPError("Unauthorized: Invalid token", 401);
	const user = User.build(payload as UserAttributes);
	const token = user.signToken("ACCESS", "1m");
	res.status(200).json({ data: token });
};


const getToken = async (res: EResponse, user: User): Promise<string> => {
	const access = user.signToken("ACCESS", "5h");
	const refresh = user.signToken("REFRESH", "1d");
	const day = 60000 * 60 * 24;
	await redisClient.set(`user:${user.id}:profile`, user.toString(), { PX: day }),
	res.cookie("refreshToken", refresh, cookieOptions);
	return access;
};


const findUser = async (id: number, verified: boolean): Promise<User> => {
	const user = await User.unscoped().findOne({ where: { id, verified } });
	if (!user)
		throw new HTTPError("Obsolete token", 403);
	user.isNewRecord = false;
	return user;
};