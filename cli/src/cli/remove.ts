import * as clack from '@clack/prompts';
import fs from 'fs/promises';
import path from 'path';

export async function removeCommand() {
  const configDir = path.join(__dirname, '../../../config/src');
  const files = await fs.readdir(configDir);
  
  const fileToRemove = await clack.select({
    message: 'Select file to remove from config',
    options: files.map(file => ({
      value: file,
      label: file
    }))
  });
  
  if (typeof fileToRemove !== 'string') return;
  
  try {
    await fs.unlink(path.join(configDir, fileToRemove));
    clack.success(`Removed ${fileToRemove} from config`);
  } catch (error) {
    clack.error(`Failed to remove ${fileToRemove}`);
  }
}
