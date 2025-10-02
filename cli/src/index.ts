#!/usr/bin/env node

import { select, isCancel } from "@clack/prompts";
import pc from "picocolors";
import { handleAdd } from "./commands/add";
import { handleRemove } from "./commands/remove";
import { handleSync } from "./commands/sync";
import { handleUse } from "./commands/use";

async function main() {
	try {
		const command = await select({
			message: "What would you like to do?",
			options: [
				{
					value: "add",
					label: "Add to repo",
					hint: "Add new configuration to repository",
				},
				{
					value: "remove",
					label: "Remove from repo",
					hint: "Remove configuration from repository",
				},
				{
					value: "sync",
					label: "Sync with repo",
					hint: "Synchronize with repository configurations",
				},
				{
					value: "use",
					label: "Use from repo",
					hint: "Apply configuration from @packages/config",
				},
			],
		});

		if (isCancel(command)) {
			process.exit(0);
		}

		switch (command) {
			case "add":
				await handleAdd();
				break;
			case "remove":
				await handleRemove();
				break;
			case "sync":
				await handleSync();
				break;
			case "use":
				await handleUse();
				break;
		}
	} catch (error) {
		if (!isCancel(error)) {
			console.error(pc.red("An error occurred:"), error);
			process.exit(1);
		}
		process.exit(0);
	}
}

main().catch((error) => {
	if (!isCancel(error)) {
		console.error(pc.red("An error occurred:"), error);
		process.exit(1);
	}
	process.exit(0);
});
