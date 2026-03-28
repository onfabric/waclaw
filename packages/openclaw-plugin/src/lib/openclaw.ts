import { mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import type { OpenClawConfig } from 'openclaw/plugin-sdk';

function getOpenClawConfigDir(): string {
  return join(homedir(), '.openclaw');
}

function getOpenClawConfigFilePath(configDir: string): string {
  return join(configDir, 'openclaw.json');
}

export function saveOpenClawConfig(config: OpenClawConfig): void {
  const configDir = getOpenClawConfigDir();
  mkdirSync(configDir, { recursive: true });

  const configPath = getOpenClawConfigFilePath(configDir);
  writeFileSync(configPath, JSON.stringify(config, null, 2));
}
