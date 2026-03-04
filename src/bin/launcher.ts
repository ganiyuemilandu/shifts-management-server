#!/usr/bin/env node

import "dotenv/config";
import { port } from "##/utils/config";
import server from "##/server";


// Listen for termination signals to gracefully shut down the server
process.on("SIGINT", () => server.close());
process.on("SIGTERM", () => server.close());
process.on("SIGHUP", () => server.close());

/**
 * Event listener for process exit.
 * Logs the exit code when the process exits.
 */
process.on("exit", (code) => {
	console.log(`Process exited with code: ${code}`);
});

// Start the server
server.listen(port as number, "0.0.0.0");