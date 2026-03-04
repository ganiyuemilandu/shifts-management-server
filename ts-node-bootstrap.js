//import { existsSync } from "node:fs";
import { register, registerHooks } from "node:module";
import { resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const baseUrl = resolvePath(process.cwd(), "src");

register("ts-node/esm", new URL(import.meta.url));

registerHooks({
	resolve: (specifier, context, nextResolve) => {
		const parentPath = context.parentURL && fileURLToPath(context.parentURL);
		if (parentPath?.startsWith(baseUrl) && specifier.startsWith("##")) {
			const ext = specifier.endsWith(".js") ? "" : ".js";
			const filePath = resolvePath(baseUrl, specifier.substring(3) + ext);
			const filePathUrl = pathToFileURL(filePath).href;
			return nextResolve(filePathUrl, context);
		}
		return nextResolve(specifier, context);
	}
});