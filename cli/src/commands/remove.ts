import { multiselect, isCancel, spinner } from "@clack/prompts";
import pc from "picocolors";
import { rm, rmdir, readdir, stat } from "node:fs/promises";
import { resolve, relative } from "node:path";
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

async function removeFromConfigSrc(sourcePath: string): Promise<void> {
	const relativePath = relative(cwd, sourcePath).replace(/\\/g, "/");
	const targetPath = resolve(configSrcDir, relativePath);

	try {
		const stats = await stat(targetPath);

		if (stats.isDirectory()) {
			const files = await readdir(targetPath);

			// Remove all files in the directory
			await Promise.all(
				files.map((file) => removeFromConfigSrc(resolve(targetPath, file))),
			);

			// Remove the directory itself
			await rmdir(targetPath);
		} else {
			// Remove the file
			await rm(targetPath);
		}
	} catch (error) {
		// File doesn't exist in config/src, that's okay
	}
}

export async function handleRemove() {
	const s = spinner();

	try {
		s.start("Scanning current directory...");
		const files = await getFiles(cwd);
		s.stop();

		if (files.length === 0) {
			return;
		}

		const selected = await multiselect({
			message: "Select files to remove:",
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

		s.start("Removing selected files from config/src...");

		// Process each selected file
		for (const filePath of selected as string[]) {
			try {
				const fileName = filePath.split(/[\\/]/).pop() || "";

				await removeFromConfigSrc(filePath);
				console.log(pc.green(`✓ Removed: ${fileName}`));
			} catch (error) {
				console.error(pc.red(`✗ Failed to remove: ${filePath}`), error);
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
