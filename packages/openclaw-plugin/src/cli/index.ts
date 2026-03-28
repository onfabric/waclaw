import type { OpenClawPluginApi } from 'openclaw/plugin-sdk';
import { command as setupCommand } from '#cli/commands/setup.ts';
import { CHANNEL_ID, CHANNEL_NAME } from '#config.ts';

const CLI_ROOT_COMMAND = CHANNEL_ID;

export function registerCli(api: OpenClawPluginApi) {
  api.registerCli(
    ({ program, config }) => {
      const cmd = program.command(CLI_ROOT_COMMAND).description(`${CHANNEL_NAME} CLI commands`);

      setupCommand.register({ cmd, config });

      api.logger.info('waclaw: registered cli commands');
    },
    { commands: [CLI_ROOT_COMMAND] },
  );
}
