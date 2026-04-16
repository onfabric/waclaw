# waclaw server

The waclaw server is a lightweight WhatsApp router that bridges a single Meta Business account with one or more [OpenClaw](https://openclaw.ai) gateways. It receives all inbound messages from the Meta webhook and routes each one to the correct OpenClaw instance based on the sender's phone number, using connector tokens created through the admin API. It also exposes an outbound send endpoint so each OpenClaw instance can deliver replies back through the same Business account.

## Deploying

### 1. Install Bun

Follow the [Installation instructions](https://bun.com/docs/installation) on the Bun website.

### 2. Clone the repository

```bash
git clone https://github.com/onfabric/waclaw.git
cd waclaw
```

### 3. Install dependencies

```bash
bun install
```

### 4. Configure environment variables

Copy the example file and fill in the values:

```bash
cp apps/waclaw/.env.example apps/waclaw/.env
```

| Variable | Description |
|---|---|
| `META_APP_SECRET` | Meta app secret (used to verify webhook signatures) |
| `META_PHONE_NUMBER_ID` | Meta phone number ID for your WhatsApp Business account |
| `META_ACCESS_TOKEN` | Meta access token for sending messages |
| `WEBHOOK_VERIFY_TOKEN` | A secret string you choose; configure the same value in the Meta webhook settings |
| `ADMIN_TOKEN` | Secret token that protects the admin API — choose something strong |
| `PORT` | Port to listen on (default: `3000`) |
| `DATABASE_PATH` | Path to the SQLite database file (default: `./data/relay.db`) |
| `HTTPS_CERT_PATH` | Path to the TLS certificate (see below) |
| `HTTPS_KEY_PATH` | Path to the TLS private key (see below) |

### 5. Obtain an HTTPS certificate with Certbot

Meta requires a publicly accessible HTTPS endpoint for webhooks. Use [Certbot](https://certbot.eff.org/) to obtain a free certificate from Let's Encrypt:

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d your.domain.com
```

Certbot stores the certificate at `/etc/letsencrypt/live/your.domain.com/`. Set the paths in your `.env`:

```env
HTTPS_CERT_PATH=/etc/letsencrypt/live/your.domain.com/fullchain.pem
HTTPS_KEY_PATH=/etc/letsencrypt/live/your.domain.com/privkey.pem
```

> **Note:** The Bun process needs read access to the Certbot certificate files. You may need to adjust the permissions or run the service as root, or copy the certs to a location accessible by your service user.

### 6. Create a systemd service

Create `/etc/systemd/system/waclaw.service`:

```ini
[Unit]
Description=waclaw WhatsApp relay server
After=network.target

[Service]
Type=simple
User=<your-username> # e.g. ubuntu
WorkingDirectory=<absolute-path-to-cloned-waclaw-repository> # e.g. /home/ubuntu/waclaw
EnvironmentFile=<absolute-path-to-env-file-configured-above> # e.g. /home/ubuntu/waclaw/apps/waclaw/.env
# Use `which bun` to find the absolute path to the Bun executable.
ExecStart=<absolute-path-to-bun-executable> run src/index.ts # e.g. /home/ubuntu/.bun/bin/bun run src/index.ts
Restart=always
RestartSec=5
```

Then enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable waclaw
sudo systemctl start waclaw
sudo systemctl status waclaw
```

### 7. Configure the Meta webhook

In the [Meta Developer Console](https://developers.facebook.com/), set your webhook URL to:

```
https://your.domain.com/webhook
```

Use the same value you chose for `WEBHOOK_VERIFY_TOKEN` when prompted for the verification token.

## Deploying with Docker

As an alternative to the systemd setup above, you can run waclaw in a container.

### 1. Configure environment variables

Same as step 4 above — copy `apps/waclaw/.env.example` to `apps/waclaw/.env` and fill in the values. `HTTPS_CERT_PATH` / `HTTPS_KEY_PATH` are typically not set when running in Docker; instead front the container with a reverse proxy (nginx, Caddy, Traefik) that terminates TLS and forwards to port 3000.

### 2. Build the image

From the monorepo root:

```bash
docker build -f apps/waclaw/Dockerfile -t waclaw .
```

### 3. Run the container

```bash
docker run -d \
  --name waclaw \
  -p 3000:3000 \
  --env-file apps/waclaw/.env \
  -v waclaw-data:/app/data \
  waclaw
```

The `waclaw-data` named volume persists the SQLite database across container restarts and image upgrades.

### 4. Configure the Meta webhook

Same as step 7 above — point the Meta webhook at your public HTTPS endpoint, which proxies to the container's port 3000.
