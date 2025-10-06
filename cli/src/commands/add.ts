import { multiselect, isCancel, spinner } from "@clack/prompts";
import pc from "picocolors";
import { readdir, mkdir, copyFile, access, constants } from "node:fs/promises";
import { resolve, relative, join, dirname } from "node:path";
import { CONFIG_PATHS } from "../utils/config-paths";

const cwd = CONFIG_PATHS.CWD;
const configSrcDir = CONFIG_PATHS.CLI_CONFIG_SRC;

interface FileItem {
	name: string;
	path: string;
	relativePath: string;
	isDirectory: boolean;
}

async function getFiles(dir: string, baseDir = dir): Promise<FileItem[]> {
	const dirents = await readdir(dir, { withFileTypes: true });
	const files = await Promise.all(
		dirents.map(async (dirent) => {
			const res = resolve(dir, dirent.name);
			const relativePath = relative(baseDir, res).replace(/\\/g, "/");

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
}

async function copyToConfigSrc(sourcePath: string, relativePath: string): Promise<void> {
	const destinationPath = resolve(configSrcDir, relativePath);

	// Create directory if it doesn't exist
	const destinationDir = dirname(destinationPath);
	try {
		await access(destinationDir, constants.F_OK);
	} catch {
		await mkdir(destinationDir, { recursive: true });
	}

	// Copy file or directory
	const stats = await import("node:fs").then(fs => fs.statSync(sourcePath));
	if (stats.isDirectory()) {
		// For directories, we'll copy recursively later if needed
		await mkdir(destinationPath, { recursive: true });
	} else {
		await copyFile(sourcePath, destinationPath);
	}
}

export async function handleAdd() {
	const s = spinner();

	try {
		s.start("Scanning current directory...");
		const files = await getFiles(cwd);
		s.stop();

		if (files.length === 0) {
			return;
		}

		const selected = await multiselect({
			message: "Select files to add:",
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

		s.start("Adding selected files to config/src...");

		// Process each selected file
		for (const filePath of selected as string[]) {
			try {
				const fileName = filePath.split(/[\\/]/).pop() || "";
				const relativePath = relative(cwd, filePath).replace(/\\/g, "/");

				await copyToConfigSrc(filePath, relativePath);
				console.log(pc.green(`✓ Added: ${relativePath}`));
			} catch (error) {
				console.error(pc.red(`✗ Failed to add: ${filePath}`), error);
			}
		}

		s.stop();
	} catch (error) {
		s.stop();
		if (!isCancel(error)) {
			console.error(pc.red("Error:"), error);
		}
	}
}
