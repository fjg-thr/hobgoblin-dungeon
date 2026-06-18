# Cursor Bugbot Deployment

This repository includes project-specific Bugbot review guidance in `.cursor/BUGBOT.md`.

## Enable Bugbot for this repository

Bugbot itself is enabled outside the repository through Cursor's Bugbot integration.

1. Open the Cursor dashboard.
2. Connect the GitHub organization or account that owns `fjg-thr/hobgoblin-dungeon`.
3. Enable Bugbot for `https://github.com/fjg-thr/hobgoblin-dungeon`.
4. Configure the trigger mode:
   - Automatic review on every pull request update for continuous review.
   - Mention-only mode if reviews should run only after a `cursor review` or `bugbot run` pull request comment.

Team admins can also enable the repository through the Bugbot API:

```bash
curl -X POST "https://api.cursor.com/bugbot/repo/update" \
  -H "Authorization: Bearer $CURSOR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"repoUrl":"https://github.com/fjg-thr/hobgoblin-dungeon","enabled":true}'
```

## Verification

After enabling Bugbot:

1. Open or update a pull request in this repository.
2. If mention-only mode is enabled, comment `cursor review` or `bugbot run` on the pull request.
3. Confirm that the `Cursor Bugbot` check or review appears on the pull request.

## Cloud-agent note

An enablement request was attempted from this cloud workspace, but outbound access to `api.cursor.com` failed during TLS connection setup. If API-based deployment is required from automation, allow outbound HTTPS access to Cursor's API host and provide a Cursor API key through the automation environment.
