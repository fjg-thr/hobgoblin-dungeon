# Cursor Bugbot Deployment Design

## Purpose

Enable Cursor Bugbot to review pull requests for this repository with guidance that matches the codebase. The repository cannot install the hosted Cursor GitHub integration by itself, so this change provides the durable repo-side configuration Bugbot reads after the repository is enabled in Cursor.

## Approach Options

1. **Managed Bugbot plus repository rules**: Add `.cursor/BUGBOT.md` with project-specific review guidance and rely on the Cursor dashboard/GitHub integration for execution.
2. **Custom GitHub Actions reviewer**: Add a pull request workflow that invokes Cursor CLI using a `CURSOR_API_KEY` secret and posts review comments.
3. **No repo changes**: Enable Bugbot only in the Cursor dashboard and use default review behavior.

The selected approach is option 1. It is the smallest deployable repository change, does not require adding secrets or a new CI permission model, and gives Bugbot enough context to review the game code with high signal.

## Architecture

- `.cursor/BUGBOT.md` is the single source of review guidance for Cursor Bugbot.
- The file describes repository context, high-value failure modes, low-value comments to avoid, and expected review tone.
- Cursor's hosted Bugbot integration must be enabled outside the repository for pull request reviews to run automatically or by comment trigger.

## Components and Data Flow

1. A developer opens or updates a pull request.
2. Cursor Bugbot, once enabled for the repository, reads the pull request diff and the repository rules.
3. Bugbot posts actionable review comments only for concrete issues it detects in changed code.

## Error Handling

If Bugbot does not run, the likely cause is integration configuration outside this repository: the GitHub repository is not connected in the Cursor dashboard, Bugbot is disabled for the repo, triggers are set to manual-only, or required organization permissions are missing.

## Testing

Because the implementation is repository configuration and documentation, verification is limited to checking that the new files are present, committed, and do not affect the application build. Run `npm run build` after committing the configuration.
