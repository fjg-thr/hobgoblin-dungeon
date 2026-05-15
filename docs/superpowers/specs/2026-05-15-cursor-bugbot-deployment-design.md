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
  grant issues:write only
  serialize runs by PR number and head SHA

  if pull request is draft:
    stop without commenting

  if pull request author is a bot:
    stop to avoid automation loops

  find existing PR comments from github-actions[bot]
    where body contains hidden marker <!-- cursor-bugbot-review --> and head SHA

  body = marker + head SHA + "bugbot run" + short explanation

  if marker comment exists for this head SHA:
    stop without duplicating the request
  else:
    create the comment so Bugbot receives a new comment event
```

## Security and Permissions

- Use `pull_request_target` only for commenting metadata; the workflow will not check out or execute pull request code.
- Scope token permissions to `issues: write` only.
- Skip draft PRs to avoid reviewing unfinished work unless the PR is marked ready.
- Skip bot-authored PRs to reduce comment loops.
- Use a hidden marker plus the PR head SHA so repeated workflow runs do not duplicate the same review request.
- Pin the GitHub-owned scripting action by commit SHA to reduce tag-mutation exposure.

## Success Criteria

- PRs opened or updated against the repository receive a Bugbot trigger comment.
- Existing trigger comments for the same PR head SHA are not duplicated.
- Workflow is valid YAML and does not execute untrusted PR code.
- README documents the Cursor dashboard/GitHub App prerequisite.

## Testing

- Validate workflow YAML parses.
- Run the existing project build to ensure repository health is unchanged.
