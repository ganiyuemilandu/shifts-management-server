import { Sequelize } from "sequelize";


export const sequelize = new Sequelize(process.env["MYSQL_URL"]!, {
	dialect: "mysql",
	logging: false,
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
	dialectOptions: {
		connectTimeout: 60000,
		ssl: {
			require: true,
			rejectUnauthorized: false,
		},
	},
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