# Cursor Bugbot Deployment

This repository now includes project-specific Bugbot review rules in `.cursor/BUGBOT.md`.

## Enable Bugbot for pull request reviews

Bugbot is enabled outside the repository through Cursor's GitHub integration:

1. Install or verify the Cursor/Bugbot GitHub app has access to `fjg-thr/hobgoblin-dungeon`.
2. Open the Cursor Bugbot dashboard.
3. Enable Bugbot for this repository.
4. Choose whether reviews run automatically on pull requests or only when requested with `cursor review` or `bugbot run`.

Team admins can also enable the repository through Cursor's Bugbot Admin API:

```bash
curl -X POST https://api.cursor.com/bugbot/repo/update \
  -H "Authorization: Bearer $CURSOR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/fjg-thr/hobgoblin-dungeon",
    "enabled": true
  }'
```

The API key is intentionally not stored in the repository. Run the command from a secure admin environment.

## Repository review rules

Bugbot automatically includes `.cursor/BUGBOT.md` when reviewing this repository. Keep that file focused on durable project constraints:

- gameplay and progression invariants,
- Next.js and client-only Phaser rendering risks,
- asset manifest and generated asset workflow expectations,
- high-signal testing expectations.
