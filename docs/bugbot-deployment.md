# Cursor Bugbot deployment

This repository includes repo-level Cursor Bugbot review guidance in
`.cursor/BUGBOT.md`.

## Hosted enablement

Bugbot must also be enabled for the GitHub repository from Cursor:

1. Open the Cursor dashboard and go to the Bugbot tab.
2. Connect or select the GitHub repository:
   `https://github.com/fjg-thr/hobgoblin-dungeon`
3. Enable Bugbot for the repository.
4. Choose the desired trigger mode:
   - automatic reviews on pull requests, or
   - manual reviews when a PR comment says `cursor review` or `bugbot run`.

Team admins can also use Cursor's Bugbot Admin API when an admin API key is
available:

```bash
curl -X POST https://api.cursor.com/bugbot/repo/update \
  -H "Authorization: Bearer $CURSOR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/fjg-thr/hobgoblin-dungeon",
    "enabled": true
  }'
```

No `CURSOR_API_KEY` or Bugbot admin token is committed to this repository.
