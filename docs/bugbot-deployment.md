# Cursor Bugbot deployment

This repository includes project-specific review guidance in `.cursor/BUGBOT.md`.
Cursor Bugbot automatically includes that file when reviewing pull requests.

## Enablement

Bugbot is enabled outside the repository from the Cursor dashboard or the Cursor
Bugbot Admin API. Enable it for:

```text
https://github.com/fjg-thr/hobgoblin-dungeon
```

For teams using the Admin API, the equivalent request is:

```bash
curl -X POST https://api.cursor.com/bugbot/repo/update \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/fjg-thr/hobgoblin-dungeon",
    "enabled": true
  }'
```

`$API_KEY` must be a Cursor API key with team admin permissions.

## Manual review trigger

After Bugbot has repository access, post one of these commands as a standalone
top-level pull request comment to request a review:

```text
cursor review
bugbot run
```

Use verbose mode when diagnosing installation or permission issues:

```text
cursor review verbose=true
bugbot run verbose=true
```
