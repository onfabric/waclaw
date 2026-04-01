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

Select **Channels** > **WhatsApp (waclaw)** and follow the prompts.

Alternatively, edit `openclaw.config.json` directly:

```json
{
  "channels": {
    "waclaw": {
      "connectorToken": "<your-connector-token>"
    }
  }
}
```

After configuring, restart the gateway:

```bash
openclaw gateway restart
```

## Additional Configuration

You can configure OpenClaw with additional functionalities.

## React to messages proactively

Edit your `openclaw.json` file with:

```json
{
  "tools": {
    "profile": "full"
  }
}
```

> If you find `"profile": "coding"` in the `tools` configuration, replace it with the content above.

## Support user-sent audio messages

Edit your `openclaw.json` file with:

```json
{
  "tools": {
    "media": {
      "audio": {
        "enabled": true,
        "models": [
          {
            "provider": "openai",
            "model": "gpt-4o-mini-transcribe"
          }
        ]
      }
    }
  }
}
```

### Support sending audio messages

Edit your `openclaw.json` file with:

```json
{
  "messages": {
    "tts": {
      "auto": "tagged",
      "provider": "elevenlabs",
      "providers": {
        "elevenlabs": {
          "enabled": true,
          "apiKey": "<your-api-key>",
          "baseUrl": "https://api.elevenlabs.io",
          "voiceId": "<your-voice-id>",
          "modelId": "eleven_multilingual_v2",
          "languageCode": "en"
        }
      }
    }
  },
  "plugins": {
    "entries": {
      "elevenlabs": { "enabled": true }
    }
  }
}
```
