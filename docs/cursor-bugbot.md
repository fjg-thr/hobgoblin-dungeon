# Cursor Bugbot Deployment

This repository includes Cursor Bugbot review rules in `.cursor/BUGBOT.md`.
Those rules improve review quality, but they do not install or enable Bugbot by themselves.

## Enable Bugbot for this repository

1. In Cursor, open the team dashboard.
2. Connect GitHub from the Cursor integrations settings if it is not already connected.
3. Install or update the Cursor GitHub App for this repository.
4. Open the Bugbot settings in Cursor.
5. Enable Bugbot for this repository.
6. Choose the desired run mode:
   - automatic review on each pull request update,
   - manual review only when mentioned, or
   - one review per pull request.

These steps require Cursor team admin and GitHub repository or organization admin access.

## Manual review triggers

If Bugbot is configured for manual runs, comment one of the following on a pull request:

```text
cursor review
```

or:

```text
bugbot run
```

## Repository rules

Bugbot reads the root `.cursor/BUGBOT.md` file for repository-level instructions.
Nested `.cursor/BUGBOT.md` files can be added later if specific subtrees need specialized review rules.

## Troubleshooting

- If Bugbot does not respond, verify that the Cursor GitHub App has access to this repository.
- If Bugbot responds but skips reviews, check the repository run mode in Cursor Bugbot settings.
- If Bugbot comments are too broad or too narrow, update `.cursor/BUGBOT.md` with more specific review priorities.
