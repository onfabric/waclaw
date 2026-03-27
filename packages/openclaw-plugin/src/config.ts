import type { OpenClawConfig } from 'openclaw/plugin-sdk/core';

/**
 * The ID of the plugin as declared in the `openclaw.plugin.json` file.
 */
export const CHANNEL_ID = 'waclaw';

type WaclawAccount = {
  accountId: string | null;
  connectorToken: string;
  allowFrom: string[];
  dmPolicy: string | undefined;
  /**
   * Default outbound recipient for native sends (e.g. cron announce).
   * Store as full E.164 with a leading `+` (e.g. `"+12025550123"`).
   * The `+` is stripped by the waclaw proxy before forwarding to the Meta Graph API.
   */
  defaultTo: string | undefined;
};

type WaclawChannelConfig = {
  connectorToken: string;
  allowFrom: string[];
  dmPolicy: string | undefined;
  /**
   * Default outbound recipient for native sends (e.g. cron announce).
   * Store as full E.164 with a leading `+` (e.g. `"+12025550123"`).
   * The `+` is stripped by the waclaw proxy before forwarding to the Meta Graph API.
   */
  defaultTo: string | undefined;
};

export function getChannelSection(cfg: OpenClawConfig): WaclawChannelConfig | undefined {
  return cfg.channels?.[CHANNEL_ID];
}

export function resolveAccount(cfg: OpenClawConfig, accountId?: string | null): WaclawAccount {
  const section = getChannelSection(cfg);
  const connectorToken = section?.connectorToken;
  if (!connectorToken) {
    throw new Error('waclaw: connectorToken is required');
  }
  return {
    accountId: accountId ?? null,
    connectorToken,
    allowFrom: section.allowFrom ?? [],
    dmPolicy: section.dmPolicy,
    defaultTo: section.defaultTo,
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
  input: { token?: string; dmAllowlist?: string[]; defaultTo?: string };
}): OpenClawConfig {
  const next = structuredClone(cfg);
  next.channels ??= {};
  next.channels[CHANNEL_ID] ??= {};

  const section = next.channels[CHANNEL_ID];
  if (input.token) {
    section.connectorToken = input.token;
  }
  if (input.dmAllowlist) {
    section.allowFrom = input.dmAllowlist;
  }
  if (input.defaultTo !== undefined) {
    section.defaultTo = input.defaultTo;
  }
  return next;
}
