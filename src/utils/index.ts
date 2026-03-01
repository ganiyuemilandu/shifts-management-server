import { Resend } from "resend"; 
import type { HTTPErrorResponse } from "@/@types/index.js";


type HTTPErrorCode = 400 | 401 | 403 | 404 | 500;

export class HTTPError extends Error {
	readonly status: HTTPErrorCode;

	constructor(message: string, status: HTTPErrorCode) {
		super(message);
		this.status = status;
	}

	toJSON(): HTTPErrorResponse {
		return {
			error: {
				name: this.name,
				message: this.message
			}
		}
	}

	override get name(): string {
		return "HTTPError";
	}
};


/**
 * * Normalize a port into a number, string, or false.
 * @param {string|number} port - The port to normalize.
 * @returns {number|string|boolean} - Returns a normalized port number, the original value if it's not a number, or false for invalid ports.
 */
export const normalizePort = (port: string): string | number | false => {
	const normalizedPort = parseInt(port, 10);
	if (isNaN(normalizedPort))
		return port; // Return the original value if it's not a number
	if (normalizedPort >= 0)
		return normalizedPort; // Return the port number if it's valid
	return false; // Return false for invalid port numbers
};


type EmailOptions = {
	from?: string,
	to: string | string[],
	subject: string,
	template: React.ReactElement,
};

const resend = new Resend(process.env["RESEND_API_KEY"]!);

export const sendEmail = async ({ from = "noreply@mail.passionshines.com", to, subject, template }: EmailOptions) => {
	const { data, error } = await resend.emails.send({ to, from, subject, react: template });
	if (error || !data?.id)
		throw new HTTPError("Unable to send email. Please try again", 500);
	return data.id;
};


export const sendBatchEmail = async ({ from = "noreply@mail.passionshines.com", to, subject, template }: EmailOptions) => {
	if (typeof to === "string")
		to = [to];
	const payload = to.map(email => ({ to: email, from, subject, react: template }));
	const { data, error } = await resend.batch.send(payload);
	if (error)
		throw new HTTPError("Unable to send batch emails. Please try again", 500);
	return data.data.length;
};