import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execPromise = promisify(exec);

export async function execAsync(command: string): Promise<string> {
  const { stdout } = await execPromise(command);
  return stdout;
}
