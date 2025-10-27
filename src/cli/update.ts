import { text, log } from '@clack/prompts';
import { execa } from 'execa';
import fs from 'fs/promises';
import path from 'path';
import { handleClackCancel } from '../utils';

export async function updateCommand() {
  try {
    // Optional: Add file to config
    const addFile = await text({
      message: 'Enter path to file you want to add to config (leave empty to skip)'
    });
    
    if (addFile) {
      handleClackCancel(addFile);
      const fileName = path.basename(addFile as string);
      const targetPath = path.join(process.cwd(), fileName);
      await fs.copyFile(addFile as string, targetPath);
      log.success(`Added ${fileName} to config`);
    }

    // Run aicommit before update
    await execa('aicommits');
    log.success('Successfully ran aicommit');
    
    // Stage all changes
    await execa('git', ['add', '.']);
    log.success('Successfully staged files');
    
    await execa('git', ['push']);
    log.success('Successfully updated remote repository');
  } catch (error) {
    log.error(`Failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
