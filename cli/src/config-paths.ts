import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuration directory paths - Single source of truth for all config paths
 */
export const CONFIG_PATHS = {
	/**
	 * Root project config directory (contains config templates)
	 * Path: d:\dev-config\config\
	 */
	ROOT_CONFIG: resolve(__dirname, "../../../config"),

	/**
	 * CLI config source directory (where user configs are managed)
	 * Path: d:\dev-config\cli\config\src\
	 */
	CLI_CONFIG_SRC: resolve(__dirname, "../../config/src"),

	/**
	 * CLI config directory (where CLI stores its own config)
	 * Path: d:\dev-config\cli\config\
	 */
	CLI_CONFIG: resolve(__dirname, "../../config"),

	/**
	 * Current working directory (where CLI is being run from)
	 */
	CWD: process.cwd(),

	/**
	 * Project root directory (where package.json is located)
	 * Path: d:\dev-config\
	 */
	PROJECT_ROOT: resolve(__dirname, "../../.."),
} as const;

export default CONFIG_PATHS;
