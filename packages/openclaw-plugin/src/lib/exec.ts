import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execPromise = promisify(exec);

export async function execAsync(command: string): Promise<string> {
  const { stdout, stderr } = await execPromise(command);
  if (stderr) {
    throw new Error(`Failed to execute command: ${stderr}`);
  }
  return stdout;
}
