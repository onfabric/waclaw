declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly META_APP_SECRET?: string;
      readonly WEBHOOK_VERIFY_TOKEN?: string;
      readonly ADMIN_TOKEN?: string;
      readonly PORT?: string;
      readonly DATABASE_PATH?: string;
    }
  }
}

type Env = {
  metaAppSecret: string;
  webhookVerifyToken: string;
  adminToken: string;
  port: number;
  databasePath: string;
};

function loadEnv(): Env {
  const required = ['META_APP_SECRET', 'WEBHOOK_VERIFY_TOKEN', 'ADMIN_TOKEN'] as const;
  const missing = required.filter((k) => !process.env[k]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    metaAppSecret: process.env.META_APP_SECRET!,
    webhookVerifyToken: process.env.WEBHOOK_VERIFY_TOKEN!,
    adminToken: process.env.ADMIN_TOKEN!,
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    databasePath: process.env.DATABASE_PATH ?? './data/relay.db',
  };
}

export const env = loadEnv();
