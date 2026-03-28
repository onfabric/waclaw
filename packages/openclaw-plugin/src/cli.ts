import * as readline from 'node:readline';
import type { OpenClawPluginApi } from 'openclaw/plugin-sdk';
import { CHANNEL_ID, CHANNEL_NAME, getChannelSection, savePluginConfig } from '#config.ts';

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise<string>((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export function registerCli(api: OpenClawPluginApi) {
  api.registerCli(
    ({ program, config }) => {
      const cmd = program.command(CHANNEL_ID).description(`${CHANNEL_NAME} commands`);

      cmd
        .command('setup')
        .description(`Configure the ${CHANNEL_NAME} channel`)
        .action(async () => {
          console.log(`\n⚙️  ${CHANNEL_NAME} Setup\n`);

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

          if (!token) {
            console.error('\n❌ No token provided. Setup cancelled.');
            return;
          }

          savePluginConfig(config, {
            connectorToken: token,
            defaultTo: phone,
            allowFrom: [],
            dmPolicy: 'allowlist',
          });

          console.log('\n✅ Configuration saved to ~/.openclaw/openclaw.json');
          console.log('  Restart the gateway to apply: openclaw gateway restart\n');
        });

      api.logger.info('waclaw: registered cli commands');
    },
    { commands: ['waclaw'] },
  );
}
