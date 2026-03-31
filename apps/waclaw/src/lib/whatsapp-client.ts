import { WhatsAppClient } from '@kapso/whatsapp-cloud-api';
import { env } from '#lib/env.ts';

export const whatsappClient = new WhatsAppClient({
  accessToken: env.metaAccessToken,
  graphVersion: 'v23.0',
});
