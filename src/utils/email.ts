import crypto from "crypto";
import jwt from "jsonwebtoken";

	import Verification from "@/emails/verification.jsx";
import type { UserAttributes } from "@/models/user.js";
import { sendEmail } from "./index.js";


export const sendVerificationEmail = (user: UserAttributes) => {
	const code = crypto.randomInt(100000, 999999).toString();
	const { id, role, verified } = user;
	const payload = { id, role, verified };
	const verifyToken = jwt.sign(payload, code, { expiresIn: "10m" });
	const resendToken = jwt.sign(payload, process.env["JWT_EMAIL_SECRET"]!, { expiresIn: "10m" });
	sendEmail({
		to: user.email,
		subject: "Verify your email",
		template: Verification({ firstName: user.firstName, lastName: user.lastName, code })
	}).catch(console.error);
	return { verifyToken, resendToken, user };
};