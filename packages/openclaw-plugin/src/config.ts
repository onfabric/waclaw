import type { OpenClawConfig } from 'openclaw/plugin-sdk/core';

/**
 * The ID of the plugin as declared in the `openclaw.plugin.json` file.
 */
export const CHANNEL_ID = 'waclaw';

export type WaclawAccount = {
  accountId: string | null;
  connectorToken: string;
  allowFrom: string[];
  dmPolicy: string | undefined;
};

export function getChannelSection(cfg: OpenClawConfig): Record<string, any> | undefined {
  return (cfg.channels as Record<string, any>)?.[CHANNEL_ID];
}

export function resolveAccount(cfg: OpenClawConfig, accountId?: string | null): WaclawAccount {
  const section = getChannelSection(cfg);
  const connectorToken = section?.connectorToken;
  if (!connectorToken) throw new Error('waclaw: connectorToken is required');
  return {
    accountId: accountId ?? null,
    connectorToken,
    allowFrom: section?.allowFrom ?? [],
    dmPolicy: section?.dmSecurity,
  };
}

export function inspectAccount(
  cfg: OpenClawConfig,
  _accountId?: string | null,
): { enabled: boolean; configured: boolean; tokenStatus: string } {
  const section = getChannelSection(cfg);
  return {
    enabled: Boolean(section?.connectorToken),
    configured: Boolean(section?.connectorToken),
    tokenStatus: section?.connectorToken ? 'available' : 'missing',
  };
}

export function listAccountIds(cfg: OpenClawConfig): string[] {
  const section = getChannelSection(cfg);
  return section?.connectorToken ? ['default'] : [];
}

export function applyAccountConfig({
  cfg,
  input,
}: {
  cfg: OpenClawConfig;
  accountId: string;
  input: { token?: string; dmAllowlist?: string[] };
}): OpenClawConfig {
  const next = structuredClone(cfg) as any;
  next.channels ??= {};
  next.channels[CHANNEL_ID] ??= {};
  const section = next.channels[CHANNEL_ID];
  if (input.token) section.connectorToken = input.token;
  if (input.dmAllowlist) section.allowFrom = input.dmAllowlist;
  return next;
}
