# Cursor Bugbot Deployment

This repository is prepared for Cursor Bugbot reviews through
`.cursor/BUGBOT.md`. Bugbot reads that file after it is merged into the default
branch.

## Required external setup

Repository changes alone cannot install or enable the Cursor GitHub app. A
Cursor team admin must:

1. Open the Cursor dashboard Bugbot settings.
2. Connect the GitHub organization or repository.
3. Enable Bugbot for this repository.
4. Choose the desired review effort level.
5. Optionally require the `Cursor Bugbot` status check in GitHub branch
   protection for `main`.

## Manual review trigger

After Bugbot is enabled, a human can trigger a review on any pull request by
posting one of these exact comments:

```text
bugbot run
```

or:

```text
cursor review
```

Use `bugbot run verbose=true` or `cursor review verbose=true` when a request ID
or detailed troubleshooting output is needed.

## Automation note

Do not trigger Bugbot by having a GitHub Actions workflow post the comment with
the default `GITHUB_TOKEN`. That comment is authored by `github-actions[bot]`
and does not reliably activate Cursor Bugbot. Prefer the dashboard's automatic
PR reviews, branch protection on the `Cursor Bugbot` check, or a deliberate
human comment.
