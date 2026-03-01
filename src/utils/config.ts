import { dirname } from "path";
import { fileURLToPath } from "url";

import { normalizePort } from "./index.js";

// Define the path to the root directory of the project
export const __dirname = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

// Initialize port from environment variable or default to 3000
export const port = normalizePort(process.env["PORT"] || "3000");