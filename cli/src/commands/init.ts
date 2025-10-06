import { spinner, confirm, isCancel } from "@clack/prompts";
import pc from "picocolors";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { execSync } from "node:child_process";
import { cpSync, existsSync } from "node:fs";
import { CONFIG_PATHS } from "../utils/config-paths";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function handleInit() {
	const s = spinner();

	try {
		console.log(pc.cyan("\n🚀 Initialize CLI Configuration\n"));

		s.start("Creating configuration directories...");

		// Create config directory in current working directory
		const currentConfigDir = path.resolve(CONFIG_PATHS.CWD, "config");
		try {
			await fs.access(currentConfigDir);
			// If exists, remove and recreate to ensure clean copy
			await fs.rm(currentConfigDir, { recursive: true, force: true });
		} catch {
			// Directory doesn't exist, will be created by copy
		}

		// Copy entire config directory from root to current directory
		const rootConfigDir = CONFIG_PATHS.ROOT_CONFIG;
		if (existsSync(rootConfigDir)) {
			cpSync(rootConfigDir, currentConfigDir, { recursive: true });
		} else {
			// If root config doesn't exist, create empty directory
			await fs.mkdir(currentConfigDir, { recursive: true });
		}

		s.stop("✓ Configuration directories created successfully!");

		console.log(pc.green("\n✅ CLI initialized!"));
		console.log(pc.cyan(`📁 Current config directory: ${currentConfigDir}`));

		// Auto git init and commit
		s.start("Initializing git repository...");
		try {
			execSync("git init", { stdio: "inherit", cwd: process.cwd() });
			s.stop("✓ Git repository initialized!");

			s.start("Creating initial commit...");
			execSync("git add .", { stdio: "inherit", cwd: process.cwd() });
			execSync('git commit -m "chore: initial project setup"', { stdio: "inherit", cwd: process.cwd() });
			s.stop("✓ Initial commit created!");

			// Ask about pushing to GitHub or NPM
			const shouldPush = await confirm({
				message: "Do you want to push to GitHub or NPM?",
				initialValue: true,
			});

			if (!isCancel(shouldPush) && shouldPush) {
				console.log(pc.cyan("\n📝 To push to GitHub, you'll need to:"));
				console.log(pc.cyan("   1. Create a repository on GitHub"));
				console.log(pc.cyan("   2. Add it as a remote: git remote add origin <repository-url>"));
				console.log(pc.cyan("   3. Push: git push -u origin main"));
				console.log(pc.cyan("\n📦 To publish to NPM, you'll need to:"));
				console.log(pc.cyan("   1. Create an NPM account if you don't have one"));
				console.log(pc.cyan("   2. Run: npm login"));
				console.log(pc.cyan("   3. Run: npm publish"));
			}
		} catch (error) {
			s.stop("✗ Failed to initialize git repository");
			console.error(pc.red("Error:"), error);
		}

	} catch (error) {
		s.stop("✗ Failed to initialize CLI");
		console.error(pc.red("\nError:"), error);
	}
}
