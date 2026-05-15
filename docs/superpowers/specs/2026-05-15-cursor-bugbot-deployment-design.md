# Cursor Bugbot PR Review Deployment Design

## Goal

Deploy repository-side automation that asks Cursor Bugbot to review pull requests whenever code changes are proposed. Cursor Bugbot itself must still be enabled for `fjg-thr/hobgoblin-dungeon` through the Cursor dashboard and GitHub App; repository code cannot install or enable that external integration.

## Options Considered

1. **Dashboard-only setup**
   - Enable Bugbot in Cursor and rely on Cursor's native settings.
   - Lowest repository maintenance, but leaves no repo-visible deployment artifact and cannot be completed fully from this workspace.

2. **GitHub Actions trigger comment**
   - Add a workflow that posts or updates a `bugbot run` PR comment.
   - Provides a repo-visible deployment path and lets Bugbot run on PR updates when the app is installed.
   - Requires careful permissions and spam prevention.

3. **Custom review bot**
   - Build a separate analyzer that reviews diffs directly.
   - Duplicates Cursor Bugbot behavior and introduces unnecessary security and maintenance burden.

Recommended approach: option 2.

## Workflow Design

Create `.github/workflows/cursor-bugbot-review.yml`.

Pseudocode:

```text
on pull_request_target opened, reopened, ready_for_review, synchronize:
  grant pull-requests:read and issues:write

  if pull request is draft:
    stop without commenting

  if pull request author is a bot:
    stop to avoid automation loops

  find existing PR comments from github-actions[bot]
    where body contains hidden marker <!-- cursor-bugbot-review -->

  body = marker + "bugbot run" + short explanation + source head SHA

  if marker comment exists:
    update it for the latest head SHA
  else:
    create the comment
```

## Security and Permissions

- Use `pull_request_target` only for commenting metadata; the workflow will not check out or execute pull request code.
- Scope token permissions to `issues: write` and `pull-requests: read`.
- Skip draft PRs to avoid reviewing unfinished work unless the PR is marked ready.
- Skip bot-authored PRs to reduce comment loops.
- Use a hidden marker so repeated synchronization updates one comment instead of creating many comments.

## Success Criteria

- PRs opened or updated against the repository receive a Bugbot trigger comment.
- Existing trigger comments are updated instead of duplicated.
- Workflow is valid YAML and does not execute untrusted PR code.
- README documents the Cursor dashboard/GitHub App prerequisite.

## Testing

- Validate workflow YAML parses.
- Run the existing project build to ensure repository health is unchanged.
