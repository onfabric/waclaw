import type { PluginRuntime } from 'openclaw/plugin-sdk/core';
import { createWaclawClient, type WaclawClient } from '#client.ts';

export type WaclawRuntime = {
  client: WaclawClient;
  pluginRuntime: PluginRuntime;
  isStopped: boolean;
  /** Message IDs the agent has reacted to via the react action. */
  agentReactedMessageIds: Set<string>;
};

let _runtime: WaclawRuntime | undefined;

export function createRuntime(pluginRuntime: PluginRuntime) {
  _runtime = {
    client: createWaclawClient(),
    pluginRuntime,
    isStopped: false,
    agentReactedMessageIds: new Set(),
  };
}

export function getRuntime(): WaclawRuntime {
  if (!_runtime) {
    throw new Error('waclaw: runtime not initialized');
  }
  return _runtime;
}
