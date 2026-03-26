declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly META_APP_SECRET?: string;
      readonly META_PHONE_NUMBER_ID?: string;
      readonly META_ACCESS_TOKEN?: string;
      readonly WEBHOOK_VERIFY_TOKEN?: string;
      readonly ADMIN_TOKEN?: string;
      readonly PORT?: string;
      readonly DATABASE_PATH?: string;
      readonly HTTPS_CERT_PATH?: string;
      readonly HTTPS_KEY_PATH?: string;
    }
  }
}

type Env = {
  metaAppSecret: string;
  metaPhoneNumberId: string;
  metaAccessToken: string;
  webhookVerifyToken: string;
  adminToken: string;
  port: number;
  databasePath: string;
  httpsCertPath?: string;
  httpsKeyPath?: string;
};

function loadEnv(): Env {
  const required = ['META_APP_SECRET', 'META_PHONE_NUMBER_ID', 'META_ACCESS_TOKEN', 'WEBHOOK_VERIFY_TOKEN', 'ADMIN_TOKEN'] as const;
  const missing = required.filter((k) => !process.env[k]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    metaAppSecret: process.env.META_APP_SECRET!,
    metaPhoneNumberId: process.env.META_PHONE_NUMBER_ID!,
    metaAccessToken: process.env.META_ACCESS_TOKEN!,
    webhookVerifyToken: process.env.WEBHOOK_VERIFY_TOKEN!,
    adminToken: process.env.ADMIN_TOKEN!,
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    databasePath: process.env.DATABASE_PATH ?? './data/relay.db',
    httpsCertPath: process.env.HTTPS_CERT_PATH,
    httpsKeyPath: process.env.HTTPS_KEY_PATH,
  };
}

export const env = loadEnv();
