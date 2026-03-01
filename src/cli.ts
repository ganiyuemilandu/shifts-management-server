import "dotenv/config";
import { program } from "commander";
import { input as promptInput, password, select } from "@inquirer/prompts";
import { connect } from "@/databases/mysql.js";
import User from "@/models/user.js";
import { profile } from "./schemas/user.js";


const init = async (message: string) => {
	await connect();
	await User.sync();
	console.log(message);
};


program.command("register").description("Registers a new user").action(async () => {
	await init("Register new user");
	const entries = await profile.parseAsync({
			firstName: await promptInput({ message: "User first name:" }),
			lastName: await promptInput({ message: "User last name:" }),
			role: await select<"staff" | "admin">({
				message: "User role:",
				choices: ["staff", "admin"]
			}),
			email: await promptInput({ message: "User email:" }),
			password: await password({ message: "User Password:", mask: "*" }),
		});
		const user = await User.create({ ...entries, verified: true });
		console.log("Created user: ", user.toJSON());
});


program.command("authenticate").description("Authenticates an existing user").action(async () => {
	await init("Authenticates an existing user");
		const user = await User.findOne({
			 where: { email: await promptInput({ message: "User email:" }) }
		});
		if (!user) {
			console.log("User not found!");
			return;
		}
		const pass = await password({ message: "User Password:", mask: "*" });
		if (await user.validatePassword(pass))
			console.log("Authentication successful!");
		else
			console.log("Authentication failed");
});


program.command("delete").description("Deletes an existing user").action(async () => {
	await init("Deletes an existing user");
		const count = await User.destroy({
			 where: { email: await promptInput({ message: "User email to delete:" }) }
		});
		console.log(`Deleted ${count} users`);
});

program.parseAsync();