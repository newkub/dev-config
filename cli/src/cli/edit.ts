import { select, note } from '@clack/prompts';
import { exec } from 'child_process';
import path from 'path';

export async function editCommand() {
  const configPath = path.join(__dirname, '../../../cli/config.ts');
  
  const editorChoice = await select({
    message: 'Choose editor to open config file:',
    options: [
      { value: 'vscode', label: 'VSCode' },
      { value: 'windsurf', label: 'Windsurf' }
    ]
  });

  if (editorChoice === 'vscode') {
    exec(`code ${configPath}`);
  } else {
    exec(`windsurf ${configPath}`);
  }
  
  note(`Opening config file with ${editorChoice}`);
}