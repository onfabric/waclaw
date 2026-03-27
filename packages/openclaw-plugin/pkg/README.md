# @onfabric/waclaw-plugin

[OpenClaw](https://openclaw.ai) channel plugin for WhatsApp via the [waclaw](https://github.com/onfabric/waclaw) proxy. Connects your OpenClaw gateway to a WhatsApp Business account — one connector token per gateway, many gateways per number.

## Requirements

A running [waclaw server](https://github.com/onfabric/waclaw) and a connector token obtained from its admin API. See the [setup guide](https://github.com/onfabric/waclaw#setup) for instructions.

## Installation

```bash
openclaw plugins install @onfabric/waclaw-plugin
```

## Configuration

Run the interactive wizard:

```bash
openclaw configure
```

Select **Channels** > **WhatsApp (waclaw)** and follow the prompts. You will be asked for:

- **Connector token** — from the waclaw admin API.
- **Default outbound number** *(optional)* — E.164 format (e.g. `+12025550123`), used for context-free sends like cron announcements.

Or edit `openclaw.config.json` directly:

```json
{
  "channels": {
    "waclaw": {
      "connectorToken": "<your-connector-token>",
      "defaultTo": "+12025550123"
    }
  }
}
```

After configuring, restart the gateway:

```bash
openclaw gateway restart
```
