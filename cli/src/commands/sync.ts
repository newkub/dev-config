import { multiselect, isCancel, spinner } from "@clack/prompts";
import pc from "picocolors";
import { readdir, stat } from "node:fs/promises";
import { resolve, relative } from "node:path";

const cwd = process.cwd();

interface FileItem {
	name: string;
	path: string;
	relativePath: string;
	isDirectory: boolean;
}

async function getFiles(dir: string, baseDir = dir): Promise<FileItem[]> {
	try {
		const dirents = await readdir(dir, { withFileTypes: true });
		const files = await Promise.all(
			dirents.map(async (dirent) => {
				const res = resolve(dir, dirent.name);
				const relativePath = relative(baseDir, res);

				if (dirent.isDirectory()) {
					return {
						name: dirent.name,
						path: res,
						relativePath: relativePath,
						isDirectory: true,
					};
				}

				return {
					name: dirent.name,
					path: res,
					relativePath: relativePath,
					isDirectory: false,
				};
			}),
		);
		return files.flat();
	} catch (error) {
		return [];
	}
}

export async function handleSync() {
	const s = spinner();

	try {
		s.start("Scanning current directory...");
		const files = await getFiles(cwd);
		s.stop();

		if (files.length === 0) {
			return;
		}

		const selected = await multiselect({
			message: "Select files to sync:",
			options: files.map((file) => ({
				value: file.path,
				label: file.relativePath,
				hint: file.isDirectory ? "Directory" : "File",
			})),
			required: true,
		});

		if (isCancel(selected)) {
			return;
		}

		s.start("Syncing selected files...");

		// Process selected files
		const itemsToSync = selected.map((filePath: string) => {
			const fileName = filePath.split(/[\\/]/).pop() || "";
			return {
				path: filePath,
				name: fileName,
			};
		});

		for (const { path, name } of itemsToSync) {
			try {
				// In a real implementation, you would sync the file here
				// For now, we'll just log the sync action
				console.log(pc.blue(`Syncing: ${name}...`));
				// Simulate some work
				await new Promise((resolve) => setTimeout(resolve, 500));
				console.log(pc.green(`✓ Synced: ${name}`));
			} catch (error) {
				console.error(pc.red(`✗ Failed to sync: ${name}`), error);
			}
		}

		s.stop("✓ Items synced successfully!");
		process.exit(0);
	} catch (error) {
		s.stop();
		if (!isCancel(error)) {
			console.error(pc.red("Error:"), error);
		}
	}
}

async function getAvailableItems(
	dirPath: string,
	_type: string,
): Promise<string[]> {
	try {
		const items = await readdir(dirPath, { withFileTypes: true });
		return items
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);
	} catch (error) {
		// Directory doesn't exist or can't be read
		return [];
	}
}
