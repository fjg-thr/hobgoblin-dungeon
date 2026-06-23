# Cursor Bugbot deployment

This repository is prepared for Cursor Bugbot reviews with project rules in
`.cursor/BUGBOT.md`.

## Enable Bugbot for this repository

Bugbot must be enabled from Cursor because repository enablement is stored in
Cursor's integration settings, not in git.

### Dashboard

1. Open the Cursor dashboard.
2. Connect or manage the GitHub integration for `https://github.com/fjg-thr/hobgoblin-dungeon`.
3. Open the Bugbot dashboard.
4. Enable Bugbot for `fjg-thr/hobgoblin-dungeon`.
5. Choose whether Bugbot should run automatically on PR updates or only when mentioned.

### Admin API

Team admins can enable the repository with a Cursor Admin API key:

```bash
curl -X POST https://api.cursor.com/bugbot/repo/update \
  -H "Authorization: Bearer $CURSOR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/fjg-thr/hobgoblin-dungeon",
    "enabled": true
  }'
```

The API key is created from the Cursor dashboard settings. The cloud agent
environment used for this branch did not expose a team Admin API key, so this
step needs to be completed by a Cursor team admin or by an automation that has
`CURSOR_ADMIN_API_KEY` configured.

## Verify reviews

- Open or update a pull request against this repository.
- If automatic reviews are enabled, confirm the `Cursor Bugbot` check appears.
- If manual reviews are enabled, comment `cursor review` or `bugbot run` on the PR.
- Confirm Bugbot applies the project rules from `.cursor/BUGBOT.md`.

## Recommended repository settings

- Run Bugbot automatically on PR updates for protected branches.
- Add the `Cursor Bugbot` check to branch protection once the first check has
  appeared in GitHub.
- Consider incremental reviews after the first full review baseline.
- Keep `.cursor/BUGBOT.md` updated whenever major gameplay, asset, or build
  conventions change.
