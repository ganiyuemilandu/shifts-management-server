import { createServer } from "http";
import * as mysql from "##/databases/mysql";
import * as redis from "##/databases/redis";
import { port } from "##/utils/config";
import app from "##/app";
import "##/models/index";

const server = createServer(app);
const debug = console.log;


/**
 * Event listener for HTTP server "listening" event.
 * Initializes the SQL connection and models when the server starts listening.
 * Logs a message when the server starts listening on the specified port.
 */
server.on("listening", async () => {
	try {
		await mysql.connect();
		await mysql.sequelize.sync();
		debug("Successfully opened mysql connection");
		await redis.connect();
		debug("Successfully opened redis conection");

		// Log server bind address
		const addr = server.address();
		const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr!.port}`;
		debug(`Listening on ${bind}`);
	} catch (error) {
		console.error("Error during server initialization:", error);
		process.exit(1);
	}
});


/** * Event listener for HTTP server "close" event.
 * Closes the database connections when the server is closed.
 */
server.on("close", async () => {
	debug("Closing server...");
	const timer = setTimeout(() => {
			debug("Forcing shutdown...");
			process.exit(1);
		}, 10000); // Force shutdown after 10 seconds
	try {
		await mysql.disconnect();
		debug("Successfully closed mysql connection");
		await redis.disconnect();
		debug("Successfully closed redis connection");
	} catch (error) {
		console.error("Error during server close:", error);
	} finally {
		clearTimeout(timer);
	}
});


/**
 * Event listener for HTTP server "error" event.
 * Handles errors related to the server, such as port conflicts or permission issues.
 */
server.on("error", (error: Record<"code" | "syscall", string>) => {
	if (error.syscall !== "listen")
		throw error;
	const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;
	// Handle specific error cases
	switch (error.code) {
		case "EACCES":
			console.error(`${bind} requires elevated privileges`);
			process.exit(1);
			break;
		case "EADDRINUSE":
			console.error(`${bind} is already in use`);
			process.exit(1);
			break;
		default:
			throw error;
	}
});

export default server;