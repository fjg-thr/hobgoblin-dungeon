# Cursor Bugbot Deployment Design

## Goal

Prepare this repository for Cursor Bugbot code review by adding repo-local review guidance and documenting the external enablement steps required to run Bugbot on pull requests.

## Context

This project is a small Next.js and Phaser game prototype. It does not currently include GitHub automation or Cursor configuration files. Cursor Bugbot is enabled through the Cursor GitHub App or Cursor Admin API, so the repository can provide rules and process documentation but cannot fully enable the service without organization-level access.

## Chosen approach

Add three focused repository artifacts:

1. `.cursor/BUGBOT.md` with project-specific review priorities.
2. `docs/cursor-bugbot.md` with deployment and manual trigger instructions.
3. `.github/pull_request_template.md` with a reminder to trigger Bugbot when automatic review is not enabled.

This keeps the implementation lightweight, avoids unsupported GitHub Actions assumptions, and makes the required admin setup explicit.

## Alternatives considered

- Add a GitHub Actions workflow: rejected because Cursor Bugbot is not deployed through Actions according to available Cursor documentation.
- Add only documentation: rejected because Bugbot supports repo-local rules, and review quality benefits from project-specific instructions.
- Attempt API-based deployment: rejected because it requires a Cursor Team Admin API key that is not available in the repository or automation environment.

## Error handling and constraints

If Bugbot does not run after these changes, repository admins should verify that the Cursor GitHub App is installed, the repository is enabled in the Bugbot dashboard, and the trigger mode matches the documented workflow.

## Testing

Because this is documentation and configuration, validation is limited to checking file presence, markdown content, and git diff. No application runtime behavior changes are expected.
