import { select, note } from '@clack/prompts';
import { execa } from 'execa';
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
    await execa('code', [configPath]);
  } else {
    await execa('windsurf', [configPath]);
  }
  
  note(`Opening config file with ${editorChoice}`);
}