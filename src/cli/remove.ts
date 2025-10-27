import { select, log } from '@clack/prompts';
import fs from 'fs/promises';
import path from 'path';
import { getExports, handleClackCancel, updateExports } from '../utils';

export async function removeCommand() {
  try {
    const exports = await getExports();
    const exportKeys = Object.keys(exports);

    if (exportKeys.length === 0) {
      log.info('No exports found in package.json to remove.');
      process.exit(0);
    }

    const exportToRemove = await select({
      message: 'Select an export to remove:',
      options: exportKeys.map(key => ({
        value: key,
        label: key,
      })),
    });

    handleClackCancel(exportToRemove);

    if (typeof exportToRemove === 'string') {
      // Remove file from project root
      const filePath = path.join(process.cwd(), exportToRemove.replace('./', ''));
      await fs.unlink(filePath);
      
      // Remove from package.json
      delete exports[exportToRemove];
      await updateExports(exports);
      
      log.success(`Removed ${exportToRemove} and deleted file`);
      process.exit(0);
    }
  } catch (error) {
    log.error(`Failed to remove: ${error.message}`);
    process.exit(1);
  }
}
