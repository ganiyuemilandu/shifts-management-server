import { existsSync } from "node:fs";
import { register, registerHooks } from "node:module";
import { resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

register("ts-node/esm", new URL(import.meta.url));

const rootDir = process.cwd();
const baseUrl = resolvePath(rootDir, "src");

registerHooks({
	resolve: (specifier, context, nextResolve) => {
		const parentPath = context.parentURL && fileURLToPath(context.parentURL);
		if (parentPath && parentPath.startsWith(baseUrl)) {
			const filePath = resolvePath(baseUrl, (specifier[0] === "@" ? "." + specifier.substring(1) : specifier));
			if (existsSync(filePath.replace(".js", ".ts")) || existsSync(filePath.replace(".js", ".tsx"))) {
				const filePathUrl = pathToFileURL(filePath).href;
				return nextResolve(filePathUrl, context);
			}
		}
		return nextResolve(specifier, context);
	}
});