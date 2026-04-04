import type { PluginRuntime } from 'openclaw/plugin-sdk/core';
import { createWaclawClient, type WaclawClient } from '#client.ts';
import { MapWithPop } from '#map.ts';

export type WaclawRuntime = {
  client: WaclawClient;
  pluginRuntime: PluginRuntime;
  isStopped: boolean;
  /** Message IDs the agent has reacted to via the react action. */
  agentReactedMessageIds: Set<string>;
  /** Stop-functions for active thinking-reaction timers, keyed by WA message ID. */
  thinkingReactionStoppers: MapWithPop<string, () => void>;
};

let _runtime: WaclawRuntime | undefined;

export function createRuntime(pluginRuntime: PluginRuntime) {
  _runtime = {
    client: createWaclawClient(),
    pluginRuntime,
    isStopped: false,
    agentReactedMessageIds: new Set(),
    thinkingReactionStoppers: new MapWithPop(),
  };
}

export function getRuntime(): WaclawRuntime {
  if (!_runtime) {
    throw new Error('waclaw: runtime not initialized');
  }
  return _runtime;
}
