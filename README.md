# waclaw

waclaw lets you host many [OpenClaw](https://openclaw.ai) instances behind a single WhatsApp Business account. Inbound messages are routed to the right OpenClaw by the sender's phone number.

Use for:
Use for:
- **One claw, one number** — your personal AI, reachable over WhatsApp like any other contact.
- **Many claws, one number** — your users each get their own AI, all texting the same Business number.

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
