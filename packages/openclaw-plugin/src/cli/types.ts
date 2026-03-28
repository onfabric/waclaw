import type { OpenClawPluginCliContext } from 'openclaw/plugin-sdk/plugin-runtime';

export type CommandCtx = {
  cmd: ReturnType<OpenClawPluginCliContext['program']['command']>;
  config: OpenClawPluginCliContext['config'];
};
