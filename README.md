# Send Discord Message Action

![Coverage](./badges/coverage.svg)[![Continuous Integration](https://github.com/sarge841/action-discord-webhook/actions/workflows/ci.yml/badge.svg)](https://github.com/sarge841/action-discord-webhook/actions/workflows/ci.yml)[![CodeQL](https://github.com/sarge841/action-discord-webhook/actions/workflows/codeql.yml/badge.svg)](https://github.com/sarge841/action-discord-webhook/actions/workflows/codeql-analysis.yml)[![Check Transpiled JavaScript](https://github.com/sarge841/action-discord-webhook/actions/workflows/check-dist.yml/badge.svg)](https://github.com/sarge841/action-discord-webhook/actions/workflows/check-dist.yml)

This action sends a message to a Discord channel via a webhook using an embedded
message format with a customizable border color.

## Features

- Sends a message to a Discord channel via a webhook.
- Uses an embed with a customizable border color for better formatting.
- Supports expanding environment variables inside messages.
- Optionally allows setting a custom username and avatar for the message.
- Allows setting various properties for the embed message.
- Uses a lightweight Node.js-based action for efficiency.

## Inputs

### `webhook_url`

**Optional** - The Discord webhook URL. If not provided as an input, it must be
set as an environment variable `DISCORD_WEBHOOK_URL`.

### `content`

**Optional** - The message content to send to Discord.

### `username`

**Optional** - The username to send the message as. If not specified, the
webhook's default username will be used.

### `avatar_url`

**Optional** - The avatar URL for the webhook message.

### `tts`

**Optional** - Set to 'true' to enable text-to-speech.

### `embed_title`

**Optional** - The title of the embed message.

### `embed_description`

**Optional** - The description of the embed message.

### `embed_url`

**Optional** - The URL to attach to the embed.

### `embed_timestamp`

**Optional** - The timestamp for the embed message (ISO 8601 format).

### `embed_color`

**Optional** - The color of the embed border for the Discord notification,
specified as a hexadecimal number (e.g., `FF5733`).

### `embed_author_name`

**Optional** - The name of the embed author.

### `embed_author_url`

**Optional** - The URL of the embed author.

### `embed_author_icon_url`

**Optional** - The icon URL for the embed author.

### `embed_footer_text`

**Optional** - The footer text for the embed.

### `embed_footer_icon_url`

**Optional** - The icon URL for the embed footer.

### `embed_fields`

**Optional** - JSON array of fields for the embed. Each field should be an
object with 'name', 'value', and 'inline'.

### `show_payload`

**Optional** - Set to 'true' to log the payload before sending. Default is
`false`.

## Environment Variables

### `DISCORD_WEBHOOK_URL`

If `webhook_url` is not provided as an input, this environment variable must be
set with the Discord webhook URL.

## How the Message is Sent

The message can be sent as either a plain text message or as a **Discord
Embed**.

## Example Usage

### Sending a Simple Notification Using Content

```yaml
name: Send Discord Notification
on: push

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send Discord Message
        uses: sarge841/action-discord-webhook@v1
        with:
          webhook_url: ${{ secrets.DISCORD_WEBHOOK_URL }}
          content: 'A new commit by ${{ github.actor }}!'
```

### Sending a Notification Using an Embed

```yaml
name: Send Discord Notification
on: push

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send Discord Message
        uses: sarge841/action-discord-webhook@v1
        with:
          webhook_url: ${{ secrets.DISCORD_WEBHOOK_URL }}
          embed_title: 'Notification'
          embed_description: 'A new commit by ${{ github.actor }}!'
          embed_color: '3498DB'
```

### Using an Environment Variable for the Webhook

```yaml
name: Send Discord Notification
on: push

jobs:
  notify:
    runs-on: ubuntu-latest
    env:
      DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
    steps:
      - name: Send Discord Message
        uses: sarge841/action-discord-webhook@v1
        with:
          content: 'Deployment by ${{ github.actor }} completed successfully!'
          embed_title: 'Success'
          embed_color: '2ECC71'
```

## Testing

Run the action locally (will need an environment variable file structured
similar to `.env.example`):

```
npx local-action . src/main.js .env
```

Run tests:

```
npm run test
```

## License

This action is open-source and free to use under the MIT license.
