import { Sequelize } from "sequelize";


export const sequelize = new Sequelize({
	username: process.env["MYSQL_USER"]!,
	password: process.env["MYSQL_PASSWORD"]!,
	database: process.env["MYSQL_DATABASE"]!,
	host: process.env["MYSQL_HOST"]!,
	port: Number.parseInt(process.env["MYSQL_PORT"]!),
	dialect: "mysql",
	logging: false
});
let authenticated: boolean = false;

export async function connect() {
	if (authenticated)
		return;
	try {
		await sequelize.authenticate();
		authenticated = true;
	} catch (err) {
		throw err;
	}
};

export async function disconnect() {
	if (!authenticated)
		return;
	try {
		await sequelize.close();
		authenticated = false;
	} catch (err) {
		throw err;
	}
};