import { execAsync } from '#lib/exec.ts';

export const cli = {
  config: {
    set: async ({ key, value }: { key: string; value: string }): Promise<void> => {
      await execAsync(`openclaw config set ${key} ${value}`);
    },
  },
};
