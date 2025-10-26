import { intro, outro, select } from '@clack/prompts';
import { editCommand } from './cli/edit';
import { syncCommand } from './cli/sync';

async function main() {
  intro('Welcome to Dev Config CLI');

  const action = await select({
    message: 'What do you want to do?',
    options: [
      { value: 'sync', label: 'Sync config' },
      { value: 'edit', label: 'Edit config' },
    ],
  });

  if (action === 'sync') {
    await syncCommand();
  } else {
    await editCommand();
  }
  
  outro('Operation completed!');
}

main().catch(console.error);