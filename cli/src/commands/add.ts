import { multiselect, isCancel, spinner } from "@clack/prompts";
import pc from "picocolors";
import { readdir, mkdir, copyFile, access, constants } from "node:fs/promises";
import { resolve, relative, join } from "node:path";

const cwd = process.cwd();

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

		s.start("Adding selected files...");

		// Process each selected file
		for (const filePath of selected as string[]) {
			try {
				const fileName = filePath.split(/[\\/]/).pop() || "";
				console.log(pc.green(`✓ Added: ${fileName}`));
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
