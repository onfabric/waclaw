import * as readline from 'node:readline';
import { CHANNEL_ID, CHANNEL_NAME, getChannelSection } from '#config.ts';

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

export function registerCli(api: {
  registerCli: (
    registrar: (ctx: { program: any; config: any }) => void,
    opts?: { commands?: string[] },
  ) => void;
  logger: { info: (msg: string) => void };
}) {
  api.registerCli(
    ({ program, config }) => {
      const cmd = program.command('waclaw').description(`${CHANNEL_NAME} commands`);

      cmd
        .command('setup')
        .description(`Configure the ${CHANNEL_NAME} channel`)
        .action(async () => {
          console.log(`\n⚙️  ${CHANNEL_NAME} Setup\n`);

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

          // Apply to config
          config.channels = config.channels || {};
          config.channels[CHANNEL_ID] = config.channels[CHANNEL_ID] || {};
          if (token) config.channels[CHANNEL_ID].connectorToken = token;
          if (phone) config.channels[CHANNEL_ID].defaultTo = phone;

          // Save
          const fs = await import('node:fs');
          const os = await import('node:os');
          const path = await import('node:path');
          const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

          console.log('\n✅ Configuration saved to ~/.openclaw/openclaw.json');
          console.log('  Restart the gateway to apply: openclaw gateway restart\n');
        });

      api.logger.info('waclaw: registered cli commands');
    },
    { commands: ['waclaw'] },
  );
}
