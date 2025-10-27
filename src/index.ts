import { select } from '@clack/prompts';
import { listCommand } from './cli/list';
import { addCommand } from './cli/add';
import { removeCommand } from './cli/remove';
import { pushCommand } from './cli/push';
import { pullCommand } from './cli/pull';

const ACTIONS = [
  { value: 'list', label: 'List', hint: 'List available configs' },
  { value: 'add', label: 'Add', hint: 'Add file to config' },
  { value: 'remove', label: 'Remove', hint: 'Remove file from config' },
  { value: 'push', label: 'Push', hint: 'Push configuration to repo' },
  { value: 'pull', label: 'Pull', hint: 'Pull configuration from repo' },
];

async function showActionMenu() {
  const action = await select({
    message: 'Select an action',
    options: ACTIONS
  });
  
  return action as string;
}

async function handleAction(action: string) {
  switch (action) {
    case 'list':
      return await listCommand()
    case 'add':
      return await addCommand()
    case 'remove':
      return await removeCommand()
    case 'push':
      return await pushCommand()
    case 'pull':
      return await pullCommand()
    default:
      throw new Error('Invalid action')
  }
}

async function main() {
  process.on('SIGINT', () => process.exit(0));
  console.log('Welcome to Dev Config CLI\n');

  try {
    const action = await showActionMenu();
    
    // ถ้าผู้ใช้กด Esc หรือ Ctrl+C
    if (action === undefined || action === null) {
      process.exit(0);
    }
    
    if (!ACTIONS.some(a => a.value === action)) {
      console.log('\nPlease select a valid action');
      return;
    }
    
    await handleAction(action);
    console.log('\nOperation completed!');
  } catch (error) {
    console.log('\nOperation failed:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);