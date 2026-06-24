# Cursor Bugbot deployment

This repository includes Cursor Bugbot project rules in `.cursor/BUGBOT.md`.
Complete the dashboard steps below to enable Bugbot to review pull requests.

## Enable Bugbot

1. In Cursor, open **Dashboard > Integrations** and connect the GitHub app.
2. Select this repository in the GitHub app installation. Choose either all repositories or selected repositories according to the organization policy.
3. Open the Bugbot dashboard at `https://cursor.com/dashboard/bugbot`.
4. Enable Bugbot for this repository.
5. Open a test pull request or comment `cursor review` on an existing pull request to confirm Bugbot runs.

## GitHub branch protection

After Bugbot has run at least once, GitHub should expose a check named `Cursor Bugbot`.
Add that check to branch protection if Bugbot review should be required before merge.

If the organization supports it, enable Bugbot's unresolved-issue failure behavior so unresolved findings fail the check instead of reporting a neutral status.

## Repository rules

Bugbot always reads the root `.cursor/BUGBOT.md` file. Add nested `.cursor/BUGBOT.md` files only when a subdirectory needs more specific review guidance.

No repository secret is required for standard Bugbot review. Store any Cursor Admin API key outside the repository if using API-based administration.
