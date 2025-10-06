import { spinner, select, isCancel } from "@clack/prompts";
import pc from "picocolors";
import { execSync } from "node:child_process";
import { CONFIG_PATHS } from "../utils/config-paths";

export async function handleMyConfig() {
	const s = spinner();

	try {
		console.log(pc.cyan("\n🔗 GitHub Repository for CLI Config\n"));

		// Check if GitHub repo exists by trying to get remote URL
		let hasGitHubRepo = false;
		let githubUrl = "";

		try {
			const remoteUrl = execSync("git remote get-url origin", {
				cwd: CONFIG_PATHS.CLI_CONFIG,
				encoding: "utf8"
			}).trim();

			if (remoteUrl && remoteUrl.includes("github.com")) {
				hasGitHubRepo = true;
				githubUrl = remoteUrl;
			}
		} catch {
			// No remote or not a git repo
		}

		if (hasGitHubRepo) {
			console.log(pc.green("✅ GitHub repository found!"));
			console.log(pc.cyan(`🔗 Repository URL: ${githubUrl}`));

			// Open GitHub in browser (this would require a browser automation tool in real implementation)
			console.log(pc.yellow("💡 To open in browser, visit the URL above"));

		} else {
			console.log(pc.yellow("❌ No GitHub repository found for CLI config"));
			console.log(pc.cyan(`📁 Local config directory: ${CONFIG_PATHS.CLI_CONFIG}`));

			// Ask if user wants to create a public GitHub repo
			const createRepo = await select({
				message: "Would you like to create a public GitHub repository for the CLI config?",
				options: [
					{ value: "yes", label: "Yes, create public repo" },
					{ value: "no", label: "No, keep local only" }
				]
			});

			if (isCancel(createRepo)) {
				return;
			}

			if (createRepo === "yes") {
				console.log(pc.cyan("\n📋 To create a public GitHub repository:"));
				console.log(pc.cyan("   1. Go to https://github.com/new"));
				console.log(pc.cyan("   2. Set repository name to 'config'"));
				console.log(pc.cyan("   3. Make it public"));
				console.log(pc.cyan("   4. Don't initialize with README (since we already have content)"));
				console.log(pc.cyan("   5. Add it as remote: git remote add origin <repository-url>"));
				console.log(pc.cyan("   6. Push: git push -u origin main"));
			} else {
				console.log(pc.yellow("👍 Keeping config local only"));
			}
		}

		s.stop("✓ GitHub repository check completed!");

	} catch (error) {
		s.stop("✗ Failed to check GitHub repository");
		console.error(pc.red("\nError:"), error);
	}
}
