import * as clack from '@clack/prompts';
import fs from 'fs/promises';
import path from 'path';
import { editCommand } from './edit';

export async function listCommand() {
  const configDir = path.join(__dirname, '../../../config/src');
  
  try {
    const files = await fs.readdir(configDir);
    
    const selectedFile = await clack.select({
      message: 'Select config file to edit:',
      options: files.map(file => ({
        value: file,
        label: file
      }))
    });
    
    if (typeof selectedFile === 'string') {
      const fullPath = path.join(configDir, selectedFile);
      await editCommand(fullPath);
    }
  } catch (error) {
    clack.error('Failed to list config files');
  }
}
