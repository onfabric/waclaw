# openclaw-plugin (waclaw)

This package is an [OpenClaw](https://openclaw.ai) channel plugin that connects your OpenClaw gateway to WhatsApp via the [waclaw server](../../apps/waclaw). Each OpenClaw instance gets its own connector token that binds it to one end-user phone number — multiple independent OpenClaw instances can share the same WhatsApp Business account through the waclaw router.

Before configuring the plugin, make sure the waclaw server is deployed and running — see the [server deployment guide](../../apps/waclaw/README.md).

## Plugin configuration

See the [`pkg/README.md`](pkg/README.md) file for instructions on how to install and configure the OpenClaw plugin after your server is up and you have a connector token.

## Development

The folder from which the plugin is published is [`./pkg`](./pkg).
