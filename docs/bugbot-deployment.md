# Cursor Bugbot Deployment

This repository includes Cursor Bugbot review guidance in `.cursor/BUGBOT.md` and a small deployment helper for enabling the managed Bugbot integration through Cursor's Admin API.

## Prerequisites

1. The Cursor GitHub App must be installed for `https://github.com/fjg-thr/hobgoblin-dungeon`.
2. The API token used here must belong to a Cursor user or team admin that can manage the repository's Bugbot settings.
3. Export a Cursor API key as `CURSOR_API_KEY`.

## Enable Bugbot

```bash
CURSOR_API_KEY=your_cursor_api_key npm run deploy:bugbot
```

The helper sends:

```json
{
  "repoUrl": "https://github.com/fjg-thr/hobgoblin-dungeon",
  "enabled": true
}
```

to Cursor's `/bugbot/repo/update` endpoint.

## Disable Bugbot

```bash
CURSOR_API_KEY=your_cursor_api_key BUGBOT_ENABLED=false npm run deploy:bugbot
```

## Override the repository URL

```bash
CURSOR_API_KEY=your_cursor_api_key \
BUGBOT_REPO_URL=https://github.com/fjg-thr/hobgoblin-dungeon \
npm run deploy:bugbot
```

## Verification

After enabling Bugbot, open or update a pull request. Cursor Bugbot should publish a `Cursor Bugbot` check and can also be triggered from a PR comment with:

```text
cursor review
```

or:

```text
bugbot run
```
