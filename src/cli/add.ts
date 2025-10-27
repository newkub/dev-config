import { text, log } from '@clack/prompts';
import fs from 'fs/promises';
import path from 'path';
import { handleClackCancel } from '../utils';

export async function addCommand() {
  const filePath = await text({
    message: 'Enter path to file you want to add to config'
  });
  
  handleClackCancel(filePath);

  const fileName = path.basename(filePath as string);
  const targetPath = path.join(process.cwd(), fileName);
  
  try {
    // Copy file to project root
    await fs.copyFile(filePath as string, targetPath);
    
    // Update package.json exports
    await updatePackageExports(fileName);
    
    log.success(`Added ${fileName} and updated package.json`);
    process.exit(0);
  } catch (error) {
    log.error(`Failed to add ${fileName}: ${error.message}`);
    process.exit(1);
  }
}

async function updatePackageExports(fileName: string) {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf-8'));
  
  if (!packageJson.exports) {
    packageJson.exports = {};
  }
  
  packageJson.exports[`./${fileName}`] = `./${fileName}`;
  
  await fs.writeFile(
    packagePath, 
    JSON.stringify(packageJson, null, 2)
  );
}
