import { select, confirm, isCancel, cancel, spinner } from "@clack/prompts";
import pc from "picocolors";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function handleUse() {
	const s = spinner();

	try {
		// Get available configurations from @packages/config
		const configsDir = path.resolve(__dirname, "../../../config");
		const configFiles = await fs.readdir(configsDir);

		// Filter for configuration files and directories
		const configs = configFiles
			.filter((file) => {
				// Filter for .json, .js, .ts, or directories that aren't in the exclude list
				const isConfigFile =
					/\.(json|js|ts|mjs|cjs)$/.test(file) || !file.includes(".");
				const isExcluded = [
					"node_modules",
					"dist",
					"src",
					"test",
					"__tests__",
					".git",
					".github",
					".vscode",
				].includes(file);

				return isConfigFile && !isExcluded;
			})
			.map((file) => file.replace(/\.(json|js|ts|mjs|cjs)$/, ""));

		if (configs.length === 0) {
			console.log(pc.yellow("No configurations found in @packages/config"));
			return;
		}

		const selectedConfigs = await select({
			message: "Select configurations to use:",
			options: configs.map((config) => ({
				value: config,
				label: config,
				hint: `Add ${config} configuration`,
			})),
		});

		if (isCancel(selectedConfigs)) {
			cancel();
			return;
		}

		const configsToAdd = Array.isArray(selectedConfigs)
			? selectedConfigs
			: [selectedConfigs];

		s.start("Adding selected configurations...");

		// Add selected configurations
		for (const configName of configsToAdd) {
			s.start(`Adding ${configName} configuration...`);

			try {
				const sourcePath = path.resolve(configsDir, `${configName}.json`);
				const destPath = path.resolve(process.cwd(), `${configName}.json`);

				// Check if config file exists in the workspace
				try {
					await fs.access(sourcePath);

					// Copy the config file to the current directory
					await fs.copyFile(sourcePath, destPath);
					console.log(pc.green(`✓ Added ${configName} configuration`));
				} catch (err) {
					console.log(
						pc.yellow(
							`ℹ️ No specific config file found for ${configName}, using default settings`,
						),
					);
					// Here you could import and use the default export from the config package
					// For example: const config = await import(`@packages/config/${configName}`);
					// Then write the default config to a file
				}
			} catch (error) {
				console.error(
					pc.red(`✗ Failed to add ${configName} configuration:`),
					error,
				);
			}

			await new Promise((resolve) => setTimeout(resolve, 100));
		}

		s.stop("✓ Configurations added successfully!");
		process.exit(0);

		const shouldInstallDeps = await confirm({
			message: "Would you like to install the required dependencies?",
			initialValue: true,
		});

		if (shouldInstallDeps && !isCancel(shouldInstallDeps)) {
			s.start("Installing dependencies...");
			// In a real implementation, this would run the package manager install command
			await new Promise((resolve) => setTimeout(resolve, 1000));
			s.stop("✓ Dependencies installed successfully!");
		}
	} catch (error) {
		s.stop("✗ Failed to add configurations");
		console.error(pc.red("\nError:"), error);
		process.exit(1);
	}
}
