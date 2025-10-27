
import * as clack from '@clack/prompts';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export const configDir = path.join(__dirname, '../../config/src');

export function handleClackCancel(value: unknown) {
  if (clack.isCancel(value)) {
    process.exit(0);
  }
}

async function getPackageJson() {
  const packageJsonPath = path.join(__dirname, '../../package.json');
  try {
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    return JSON.parse(packageJsonContent);
  } catch (error) {
    clack.error('Failed to read package.json');
    console.error(error);
    process.exit(1);
  }
}

export async function getExports() {
  const packageJson = await getPackageJson();
  return packageJson.exports || {};
}

export async function updateExports(newExports: Record<string, any>) {
    const packageJsonPath = path.join(__dirname, '../../package.json');
    const packageJson = await getPackageJson();
    packageJson.exports = newExports;
    const updatedPackageJsonContent = JSON.stringify(packageJson, null, 2);
    await fs.writeFile(packageJsonPath, updatedPackageJsonContent, 'utf-8');
}
