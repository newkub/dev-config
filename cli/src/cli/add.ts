import * as clack from '@clack/prompts';
import fs from 'fs/promises';
import path from 'path';

export async function addCommand() {
  const filePath = await clack.text({
    message: 'Enter path to file you want to add to config'
  });
  
  const configDir = path.join(__dirname, '../../../config/src');
  const fileName = path.basename(filePath);
  const targetPath = path.join(configDir, fileName);
  
  try {
    await fs.copyFile(filePath, targetPath);
    clack.success(`Added ${fileName} to config`);
  } catch (error) {
    clack.error(`Failed to add ${fileName}`);
  }
}
