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

      // Connector token
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

      // Default outbound phone
      console.log('\nDefault outbound phone number is used for cron announcements.');
      console.log('Must be E.164 format with a leading "+" (e.g. +12025550123).');
      console.log('Leave blank to skip.\n');

      let phone: string | undefined;
      if (existing?.defaultTo) {
        console.log(`Current default: ${existing.defaultTo}`);
        const keep = await prompt('Keep current number? (Y/n): ');
        if (keep.toLowerCase() === 'n') {
          phone = await prompt('Default outbound phone number: ');
          if (phone && !/^\+\d+$/.test(phone)) {
            console.error('\n❌ Invalid format. Must be E.164 (e.g. +12025550123).');
            return;
          }
        }
      } else {
        phone = await prompt('Default outbound phone number: ');
        if (phone && !/^\+\d+$/.test(phone)) {
          console.error('\n❌ Invalid format. Must be E.164 (e.g. +12025550123).');
          return;
        }
      }

      if (token) {
        await cli.config.set({ key: `channels.${CHANNEL_ID}.connectorToken`, value: token });
      }
      if (phone) {
        await cli.config.set({ key: `channels.${CHANNEL_ID}.defaultTo`, value: phone });
      }

      console.log('\n✅ Configuration saved.');
      console.log('  Restart the gateway to apply: openclaw gateway restart\n');
    });
}

export const command = {
  register,
};
