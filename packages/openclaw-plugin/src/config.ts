import type { OpenClawConfig } from 'openclaw/plugin-sdk/core';

/**
 * The ID of the plugin as declared in the `openclaw.plugin.json` file.
 */
export const CHANNEL_ID = 'waclaw';
/**
 * The name of the channel as declared in the `openclaw.plugin.json` file.
 */
export const CHANNEL_NAME = 'WhatsApp (waclaw)';
/**
 * The description of the channel as declared in the `openclaw.plugin.json` file.
 */
export const CHANNEL_DESCRIPTION = 'WhatsApp channel plugin via the waclaw proxy';

type WaclawAccount = {
  accountId: string | null;
  connectorToken: string | undefined;
};

type WaclawChannelConfig = {
  connectorToken: string;
};

export function getChannelSection(cfg: OpenClawConfig): WaclawChannelConfig | undefined {
  return cfg.channels?.[CHANNEL_ID];
}

export function isChannelConfigured(cfg: OpenClawConfig): boolean {
  return Boolean(getChannelSection(cfg)?.connectorToken);
}

export function resolveAccount(cfg: OpenClawConfig, accountId?: string | null): WaclawAccount {
  const section = getChannelSection(cfg);
  return {
    accountId: accountId ?? null,
    connectorToken: section?.connectorToken,
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
  input: { token?: string };
}): OpenClawConfig {
  const next = structuredClone(cfg);
  next.channels ??= {};
  next.channels[CHANNEL_ID] ??= {};

  const section = next.channels[CHANNEL_ID];
  if (input.token) {
    section.connectorToken = input.token;
  }
  return next;
}
