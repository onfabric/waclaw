import type { CommandCtx } from '#cli/types.ts';
import { CHANNEL_ID, CHANNEL_NAME, getChannelSection } from '#config.ts';
import { prompt } from '#lib/cli.ts';
import { cli } from '#lib/openclaw.ts';

function register({ cmd, config }: CommandCtx) {
  cmd
    .command('setup')
    .description(`Configure the ${CHANNEL_NAME} channel`)
    .action(async () => {
      console.log(`\n⚙️ ${CHANNEL_NAME} Setup\n`);

      const existing = getChannelSection(config);

      let token: string | undefined;
      if (existing?.connectorToken) {
        console.log(`Current connector token: ${existing.connectorToken.slice(0, 8)}...`);
        const keep = await prompt('Keep current token? (Y/n): ');
        if (keep.toLowerCase() === 'n') {
          token = await prompt('Enter your waclaw connector token: ');
          if (!token) {
            console.error('\n❌ No token provided. Setup cancelled.');
            return;
          }
        }
      } else {
        token = await prompt('Enter your waclaw connector token: ');
        if (!token) {
          console.error('\n❌ No token provided. Setup cancelled.');
          return;
        }
      }

      if (token) {
        await cli.config.set({ key: `channels.${CHANNEL_ID}.connectorToken`, value: token });
      }

      console.log('\n✅ Configuration saved.');
      console.log('  Restart the gateway to apply: openclaw gateway restart\n');
    });
}

export const command = {
  register,
};
