# waclaw

waclaw is a self-hosted WhatsApp router for [OpenClaw](https://openclaw.ai) that connects a single WhatsApp Business account to one or more OpenClaw instances.

It works as a **router**: a single WhatsApp Business account receives all inbound messages, and waclaw routes each conversation to the correct OpenClaw instance based on the sender's phone number. Every OpenClaw gateway gets its own **connector token** that is bound to one or more sender numbers — so multiple gateways can share the same Business account without interfering with each other.

This makes waclaw a good fit both for personal deployments (one openclaw, one WhatsApp number) and for hosting scenarios where a company runs many OpenClaw instances and wants their users to reach each instance through WhatsApp.

## Repository structure

| Package | Description |
|---|---|
| [`apps/waclaw`](apps/waclaw) | The relay server — receives webhooks from Meta and exposes poll/send endpoints |
| [`packages/openclaw-plugin`](packages/openclaw-plugin) | The OpenClaw channel plugin that talks to the relay server |

## Setup

### 1. Deploying the server
See the [server deployment guide](apps/waclaw/README.md) for step-by-step instructions.

### 2. Creating a connector token

A **connector token** ties one or more sender phone numbers to a specific OpenClaw instance. When waclaw receives a message from a registered sender, it delivers it to whichever OpenClaw gateway holds the matching token. Create a token for each OpenClaw instance you want to connect:

```bash
curl -s -X POST https://your.domain.com/admin/routes \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"sender_phone": "+12025550123"}' | jq .
```

Replace `<ADMIN_TOKEN>` with the value you set for `ADMIN_TOKEN` in the server's `.env` file, and `+12025550123` with the E.164 phone number of the user (or the number you want routed to this particular OpenClaw instance). Repeat this step for each OpenClaw instance you are connecting — each gets its own token, bound to the sender numbers that should reach it.

A successful response looks like:

```json
{
  "id": "a1b2c3d4-...",
  "sender_phone": "+12025550123",
  "connector_token": "a1b2c3d4-...",
  "created_at": 1712345678
}
```

Copy the `connector_token` value — you will need it when configuring the plugin.

To list all existing tokens:

```bash
curl -s https://your.domain.com/admin/routes \
  -H "Authorization: Bearer <ADMIN_TOKEN>" | jq .
```

To revoke a token:

```bash
curl -s -X DELETE https://your.domain.com/admin/routes/<connector_token> \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### 3. Configuring the plugin

See the [plugin configuration guide](packages/openclaw-plugin/README.md) for instructions on how to install and configure the OpenClaw plugin after your server is up and you have a connector token.

### 4. Sending and receiving messages

You can message the WhatsApp Business account, and OpenClaw will answer.
