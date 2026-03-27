# openclaw-plugin (waclaw)

This package is an [OpenClaw](https://openclaw.ai) channel plugin that connects your OpenClaw gateway to WhatsApp via the [waclaw server](../../apps/waclaw). Each OpenClaw instance gets its own connector token that binds it to one end-user phone number — multiple independent OpenClaw instances can share the same WhatsApp Business account through the waclaw router.

Before configuring the plugin, make sure the waclaw server is deployed and running — see the [server deployment guide](../../apps/waclaw/README.md).

## Configuring the plugin

Once you have a running waclaw server and a connector token (see the [connector token guide](../../README.md#creating-a-connector-token)), run the OpenClaw interactive setup wizard:

```bash
openclaw configure
```

Select **Channels** > **WhatsApp (waclaw)** from the channel list and follow the prompts:

- **Connector token** — paste the `connector_token` value you obtained from the admin API.
- **Default outbound phone number** *(optional)* — a full [E.164](https://en.wikipedia.org/wiki/E.164) number (e.g. `+12025550123`). This is used for context-free outbound sends such as cron announcements. Leave blank if you do not use that feature.

After completing the wizard, restart the OpenClaw gateway for the changes to take effect:

```bash
openclaw gateway restart
```

### Manual configuration

If you prefer to edit the config file directly, add the following section under `channels` in your `openclaw.config.json`:

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

`defaultTo` is optional and can be omitted if you do not need context-free outbound sends.

## Development

The folder from which the plugin is published is [`./pkg`](./pkg).
