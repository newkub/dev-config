#!/usr/bin/env node

import { select, isCancel } from "@clack/prompts";
import pc from "picocolors";
import { handleAdd } from "./commands/add";
import { handleRemove } from "./commands/remove";
import { handleSync } from "./commands/sync";
import { handleMyConfig } from "./commands/my-config";
import { handleInit } from "./commands/init";

// Handle Ctrl+C gracefully
let isShuttingDown = false;

function handleShutdown() {
	if (isShuttingDown) {
		console.log(pc.yellow("\n🛑 Force exiting..."));
		process.exit(1);
	}

	isShuttingDown = true;
	console.log(pc.yellow("\n👋 Shutting down gracefully... Press Ctrl+C again to force exit"));
	setTimeout(() => {
		if (isShuttingDown) {
			console.log(pc.yellow("🛑 Taking too long, force exiting..."));
			process.exit(1);
		}
	}, 3000);
}

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

async function main() {
	try {
		const command = await select({
			message: "What would you like to do?",
			options: [
				{
					value: "init",
					label: "Init",
					hint: "Initialize CLI configuration",
				},
				{
					value: "add",
					label: "Add",
					hint: "Add configuration to repository",
				},
				{
					value: "list",
					label: "My Config",
					hint: "Show my current configurations",
				},
				{
					value: "remove",
					label: "Remove",
					hint: "Remove configuration from repository",
				},
				{
					value: "sync",
					label: "Sync",
					hint: "Synchronize with repository",
				},
			],
		});

		if (isCancel(command)) {
			console.log(pc.yellow("👋 Goodbye!"));
			return; // Exit gracefully without calling process.exit
		}

		switch (command) {
			case "init":
				await handleInit();
				break;
			case "add":
				await handleAdd();
				break;
			case "list":
				await handleMyConfig();
				break;
			case "remove":
				await handleRemove();
				break;
			case "sync":
				await handleSync();
				break;
		}
	} catch (error) {
		if (!isCancel(error)) {
			console.error(pc.red("An error occurred:"), error);
		}
		// Don't call process.exit here, let the main().catch() handle it
		throw error; // Re-throw to be caught by main().catch()
	}
}

main().catch((error) => {
	if (!isCancel(error)) {
		console.error(pc.red("An error occurred:"), error);
		process.exit(1);
	}
	// If it's a cancel error, exit gracefully
	console.log(pc.yellow("👋 Goodbye!"));
});
