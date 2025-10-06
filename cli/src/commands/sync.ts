import { multiselect, isCancel, spinner, confirm } from "@clack/prompts";
import pc from "picocolors";
import { readdir, stat, copyFile, access, constants } from "node:fs/promises";
import { resolve, relative, dirname } from "node:path";
import { CONFIG_PATHS } from "../utils/config-paths";

const cwd = CONFIG_PATHS.CWD;
const configDir = CONFIG_PATHS.CLI_CONFIG_SRC;

interface FileItem {
	name: string;
	path: string;
	relativePath: string;
	isDirectory: boolean;
	size?: number;
	modifiedTime?: Date;
}

async function getFiles(dir: string, baseDir = dir): Promise<FileItem[]> {
	try {
		const dirents = await readdir(dir, { withFileTypes: true });
		const files = await Promise.all(
			dirents.map(async (dirent) => {
				const res = resolve(dir, dirent.name);
				const relativePath = relative(baseDir, res);

				// Skip common directories that shouldn't be synced
				if (dirent.isDirectory() && ['node_modules', '.git', 'dist', 'build'].includes(dirent.name)) {
					return null;
				}

				const stats = await stat(res);
				return {
					name: dirent.name,
					path: res,
					relativePath: relativePath,
					isDirectory: dirent.isDirectory(),
					size: stats.size,
					modifiedTime: stats.mtime,
				};
			}),
		);
		return files.filter((file): file is NonNullable<typeof file> => file !== null);
	} catch (error) {
		return [];
	}
}

async function fileExists(filePath: string): Promise<boolean> {
	try {
		await access(filePath, constants.F_OK);
		return true;
	} catch {
		return false;
	}
}

async function filesAreIdentical(file1: string, file2: string): Promise<boolean> {
	try {
		const [stat1, stat2] = await Promise.all([stat(file1), stat(file2)]);
		if (stat1.size !== stat2.size) return false;

		// For now, assume same size means identical (could improve with content comparison)
		return true;
	} catch {
		return false;
	}
}

async function syncFile(sourcePath: string, targetPath: string, relativePath: string): Promise<boolean> {
	try {
		// Create target directory if it doesn't exist
		const targetDir = dirname(targetPath);
		try {
			await access(targetDir, constants.F_OK);
		} catch {
			// Directory doesn't exist, but for now we'll skip creating it
			// In a real implementation, you might want to create the directory structure
			console.log(pc.yellow(`⚠️  Target directory doesn't exist: ${targetDir}`));
			return false;
		}

		// Copy file if target doesn't exist or is different
		const exists = await fileExists(targetPath);
		if (!exists) {
			await copyFile(sourcePath, targetPath);
			console.log(pc.green(`✓ Created: ${relativePath}`));
			return true;
		}

		const identical = await filesAreIdentical(sourcePath, targetPath);
		if (!identical) {
			await copyFile(sourcePath, targetPath);
			console.log(pc.blue(`✓ Updated: ${relativePath}`));
			return true;
		}

		console.log(pc.gray(`○ Unchanged: ${relativePath}`));
		return true;
	} catch (error) {
		console.error(pc.red(`✗ Failed to sync ${relativePath}:`), error);
		return false;
	}
}

export async function handleSync() {
	const s = spinner();

	try {
		console.log(pc.cyan("\n🔄 AI-Powered Configuration Sync\n"));
		console.log(pc.cyan(`📁 Source: ${cwd}`));
		console.log(pc.cyan(`📁 Target: ${configDir}\n`));

		s.start("Scanning current directory...");
		const currentFiles = await getFiles(cwd);
		s.stop();

		if (currentFiles.length === 0) {
			console.log(pc.yellow("No files found in current directory"));
			return;
		}

		// Get config files for comparison
		s.start("Scanning config directory...");
		const configFiles = await getFiles(configDir);
		const configFileMap = new Map(configFiles.map(f => [f.relativePath, f]));
		s.stop();

		// Find files that need syncing
		const filesToSync: Array<{
			file: FileItem;
			action: 'create' | 'update' | 'skip';
			configFile?: FileItem;
		}> = [];

		for (const file of currentFiles) {
			const configFile = configFileMap.get(file.relativePath);

			if (!configFile) {
				filesToSync.push({ file, action: 'create' });
			} else {
				const identical = await filesAreIdentical(file.path, configFile.path);
				if (!identical) {
					filesToSync.push({ file, action: 'update', configFile });
				} else {
					filesToSync.push({ file, action: 'skip', configFile });
				}
			}
		}

		if (filesToSync.length === 0) {
			console.log(pc.green("✅ All files are already in sync!"));
			return;
		}

		// Show what will be synced
		console.log(pc.cyan("\n📋 Files to sync:\n"));

		filesToSync.forEach(({ file, action }) => {
			const icon = action === 'create' ? '🆕' : action === 'update' ? '🔄' : '⏭️';
			const color = action === 'create' ? pc.green : action === 'update' ? pc.blue : pc.gray;
			console.log(`${icon} ${color(file.relativePath)}`);
		});

		// Ask for confirmation
		const shouldSync = await confirm({
			message: `Sync ${filesToSync.filter(f => f.action !== 'skip').length} files to config?`,
			initialValue: true,
		});

		if (isCancel(shouldSync) || !shouldSync) {
			console.log(pc.yellow("⏭️ Sync cancelled"));
			return;
		}

		s.start("Syncing files...");

		let successCount = 0;
		let errorCount = 0;

		for (const { file, action } of filesToSync) {
			if (action === 'skip') continue;

			const targetPath = resolve(configDir, file.relativePath);
			const success = await syncFile(file.path, targetPath, file.relativePath);

			if (success) {
				successCount++;
			} else {
				errorCount++;
			}
		}

		s.stop();

		if (errorCount === 0) {
			console.log(pc.green(`\n✅ Successfully synced ${successCount} files!`));
		} else {
			console.log(pc.yellow(`\n⚠️ Synced ${successCount} files, ${errorCount} errors`));
		}

	} catch (error) {
		s.stop();
		if (!isCancel(error)) {
			console.error(pc.red("Error:"), error);
		}
	}
}
