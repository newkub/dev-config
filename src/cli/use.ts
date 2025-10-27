import * as clack from '@clack/prompts';
import fs from 'fs/promises';
import path from 'path';
import { configDir, handleClackCancel } from '../utils';

export async function useCommand() {
  // 1. Get selected file path from user
  const selectedFile = await clack.text({
    message: 'Enter path to file you want to sync'
  });
  
  handleClackCancel(selectedFile);

  // 2. Check if file exists in config/src
  const files = await fs.readdir(configDir);
  
  const matchingFile = files.find(f => f === path.basename(selectedFile as string));
  
  if (!matchingFile) {
    clack.error('No matching file found in config directory');
    return;
  }

  // 3. Replace file if matches
  const configFilePath = path.join(configDir, matchingFile);
  await fs.copyFile(selectedFile as string, configFilePath);
  
  clack.success(`Successfully synced ${matchingFile}`);
}