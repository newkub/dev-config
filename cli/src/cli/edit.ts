import { select, note } from '@clack/prompts';
import { execa } from 'execa';
import path from 'path';
import fs from 'fs/promises';
import { createServer } from 'node:net';

export async function editCommand(filePath?: string) {
  const configChoice = filePath ? undefined : await select({
    message: 'Choose config to edit:',
    options: [
      { value: 'local', label: 'Local config' },
      { value: 'github', label: 'GitHub config' },
    ],
  });

  let configPath = filePath || '';
  
  if (!filePath) {
    if (configChoice === 'local') {
      configPath = path.join(__dirname, '../../../cli/config.ts');
    } else {
      // Download from GitHub
      const url = 'https://raw.githubusercontent.com/newkub/dev-config/refs/heads/main/biome.jsonc';
      configPath = path.join(__dirname, '../../../temp-biome.jsonc');
      await execa('curl', ['-o', configPath, url]);
    }
  }

  // Start terminal server for commit option
  const server = createServer((socket) => {
    socket.write('Commit changes? (y/n): ');
    
    socket.on('data', async (data) => {
      if (data.toString().trim().toLowerCase() === 'y') {
        await execa('git', ['add', configPath]);
        await execa('git', ['commit', '-m', 'Update config']);
        await execa('git', ['push']);
        socket.write('Changes committed and pushed!\n');
      }
      socket.end();
    });
  }).listen(0, () => {
    const port = server.address().port;
    note(`Terminal server running on port ${port}. Use 'nc localhost ${port}' to commit.`);
  });

  // Open in editor
  const editorChoice = await select({
    message: 'Choose editor:',
    options: [
      { value: 'vscode', label: 'VSCode' },
      { value: 'windsurf', label: 'Windsurf' },
    ],
  });

  if (editorChoice === 'vscode') {
    await execa('code', [configPath]);
  } else {
    await execa('windsurf', [configPath]);
  }
  
  note(`Opening ${path.basename(configPath)} with ${editorChoice}`);
}