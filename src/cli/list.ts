import { select, log } from '@clack/prompts';
import { getExports, handleClackCancel } from '../utils';

export async function listCommand() {
  try {
    const exports = await getExports();
    const exportKeys = Object.keys(exports);

    const selectedExport = await select({
      message: 'Available exports:',
      options: exportKeys.map(key => ({
        value: key,
        label: key,
      })),
    });

    handleClackCancel(selectedExport);

    // You can add logic here to handle the selected export
    log.info(`You selected: ${selectedExport}`);
  } catch (error) {
    log.error('Failed to list exports from package.json');
    console.error(error);
  }
}
