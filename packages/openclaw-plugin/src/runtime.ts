import { createWaclawClient, type WaclawClient } from '#client.ts';

export type WaclawRuntime = {
  client: WaclawClient;
  isStopped: boolean;
};

let _runtime: WaclawRuntime | undefined;

export function createRuntime() {
  _runtime = {
    client: createWaclawClient(),
    isStopped: false,
  };
}

export function getRuntime(): WaclawRuntime {
  if (!_runtime) {
    throw new Error('waclaw: runtime not initialized');
  }
  return _runtime;
}
