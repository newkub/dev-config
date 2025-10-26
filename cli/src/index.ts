import { intro, outro, select } from '@clack/prompts';
import { editCommand } from './cli/edit';
import { useCommand } from './cli/use';
import { listCommand } from './cli/list';
import { addCommand } from './cli/add';
import { removeCommand } from './cli/remove';

async function main() {
  intro('Welcome to Dev Config CLI');

  const action = await select({
    message: 'Select action:',
    options: [
      { value: 'edit', label: 'Edit', hint: 'Edit configuration file' },
      { value: 'use', label: 'Use', hint: 'Use configuration from repo' },
      { value: 'list', label: 'List', hint: 'List available configs' },
      { value: 'add', label: 'Add', hint: 'Add file to config' },
      { value: 'remove', label: 'Remove', hint: 'Remove file from config' },
      { value: 'exit', label: 'Exit', hint: 'Exit the program' },
    ],
  });

  if (action === 'exit') {
    outro('Operation completed!');
    return;
  }

  try {
    if (action === 'use') {
      await useCommand();
    } else if (action === 'list') {
      await listCommand();
    } else if (action === 'add') {
      await addCommand();
    } else if (action === 'remove') {
      await removeCommand();
    } else {
      await editCommand();
    }
    outro('Operation completed!');
  } catch {
    outro('Operation cancelled');
  }
}

main().catch(console.error);