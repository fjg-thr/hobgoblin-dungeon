# Cursor Bugbot deployment

Cursor Bugbot is a managed PR review service. This repository carries project-specific review guidance in `.cursor/BUGBOT.md`, but enabling Bugbot for the repository is done through the Cursor dashboard and GitHub integration.

## Enable Bugbot for this repository

1. Open the Cursor dashboard: <https://cursor.com/dashboard>
2. Connect or manage the GitHub integration.
3. Ensure the GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
4. Open the Bugbot dashboard: <https://cursor.com/dashboard/bugbot>
5. Enable Bugbot for `fjg-thr/hobgoblin-dungeon`.

After Bugbot is enabled, it reviews pull requests according to the dashboard settings. The repository-level rules in `.cursor/BUGBOT.md` are included as additional context for those reviews.

## Trigger a review manually

On a pull request, comment one of:

```text
cursor review
```

```text
bugbot run
```

If Bugbot does not run as expected, use the verbose form in a PR comment to get troubleshooting details:

```text
bugbot run verbose=true
```

## Local validation commands

Bugbot review should be paired with local verification before merging:

```bash
npm run build
```

```bash
npm run lint
```

Both commands should exit successfully before merging PRs reviewed by Bugbot.
