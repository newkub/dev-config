#!/usr/bin/env node

/**
 * Generate exports object for package.json automatically
 *
 * This script scans the src directory and generates export mappings
 * for all supported configuration files.
 *
 * Usage:
 *   bun scripts/generate-exports.ts
 *
 * The script will:
 * 1. Scan all files in src directory recursively
 * 2. Generate export paths based on file names and locations
 * 3. Update the exports field in package.json
 * 4. Handle special cases like .oxlintrc.json and wrikka-uno-preset.ts
 */

import { readdir } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import { resolve, extname, basename, posix } from 'node:path';

// Get source directory from command line arguments or use default
const args = process.argv.slice(2);
const srcDirName = args[0] || 'src';
const srcDir = resolve(import.meta.dirname, '..');
const packageJsonPath = resolve(import.meta.dirname, '..', 'package.json');

/**
 * File extensions that should be included in exports
 */
const INCLUDED_EXTENSIONS = new Set([
	'.json',
	'.jsonc',
	'.mjs',
	'.cjs',
	'.ts',
	'.js',
	'.yml',
	'.yaml',
	'.toml',
	'.xml',
	'.ini',
	'.properties',
	'.env',
	'.md',
	'.txt',
	'.grit',
	'.lock'
]);

/**
 * Files that should be excluded from exports
 */
const EXCLUDED_FILES = new Set([
	'package.json',
	'README.md',
	'.gitkeep'
]);

/**
 * Special file mappings for exports paths
 */
const SPECIAL_MAPPINGS: Record<string, string> = {
	'.oxlintrc.json': '.oxlintrc.json',
	'.release-it.json': '.release-it.json',
	'wrikka-uno-preset.ts': 'presetWrikka/index.ts'
};

/**
 * Get the export path for a file
 */
function getExportPath(fileName: string, filePath: string): string {
	// Check for special mappings first
	for (const [key, value] of Object.entries(SPECIAL_MAPPINGS)) {
		if (filePath.includes(key)) {
			return value;
		}
	}

	// Remove leading dot if present
	const cleanName = fileName.startsWith('.') ? fileName.substring(1) : fileName;
	return cleanName;
}

/**
 * Generate exports object from src directory files
 */
async function generateExports(): Promise<Record<string, string>> {
	try {
		const files = await readdir(srcDir, { recursive: true });

		const exports: Record<string, string> = {};
		const generatedExports: string[] = [];

		for (const file of files) {
			const ext = extname(file);
			const fileName = basename(file);

			// Skip excluded files
			if (EXCLUDED_FILES.has(fileName)) {
				continue;
			}

			// Only include files with supported extensions
			if (!INCLUDED_EXTENSIONS.has(ext)) {
				continue;
			}

			const exportPath = getExportPath(fileName, file);
			// Ensure forward slashes for cross-platform compatibility
			const normalizedFile = file.replace(/\\/g, '/');
			exports[`./${exportPath}`] = `./${srcDirName}/${normalizedFile}`;
			
			// Log generated export
			generatedExports.push(`  ${exportPath}`);
		}

		console.log(`🔍 Found ${generatedExports.length} files to export:`);
		generatedExports.forEach(exportItem => console.log(exportItem));
		console.log('');

		return exports;
	} catch (error) {
		console.error('Error reading src directory:', error);
		throw error;
	}
}

/**
 * Update package.json with new exports
 */
async function updatePackageJson(): Promise<Record<string, string>> {
	try {
		// Read current package.json
		const packageJsonContent = await import(packageJsonPath, { assert: { type: 'json' } });
		const packageJson = packageJsonContent.default;

		// Generate new exports
		const newExports = await generateExports();

		// Update exports in package.json
		packageJson.exports = newExports;

		// Write back to package.json
		await writeFile(
			packageJsonPath,
			JSON.stringify(packageJson, null, '\t'),
			'utf8'
		);

		console.log('✅ Successfully updated exports in package.json');
		console.log(`📦 Generated ${Object.keys(newExports).length} exports`);

		return newExports;
	} catch (error) {
		console.error('Error updating package.json:', error);
		throw error;
	}
}

// Run the script
updatePackageJson().catch(console.error);
