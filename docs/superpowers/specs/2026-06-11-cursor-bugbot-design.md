# Cursor Bugbot Deployment Design

## Purpose

Enable Cursor Bugbot to review pull requests for this repository with guidance and verification signals that match the codebase. The repository cannot install the hosted Cursor GitHub integration by itself, so this change provides the durable repo-side configuration, CI baseline, and smoke checks Bugbot can rely on after the repository is enabled in Cursor.

## Approach Options

1. **Managed Bugbot plus repository rules and CI baseline**: Add `.cursor/BUGBOT.md`, document the setup in the README, pin audited dependency versions, and add CI/smoke checks that give Bugbot concrete verification expectations.
2. **Custom GitHub Actions reviewer**: Add a pull request workflow that invokes Cursor CLI using a `CURSOR_API_KEY` secret and posts review comments.
3. **Rules-only deployment**: Add `.cursor/BUGBOT.md` and rely on local/manual verification without improving the automated baseline.

The selected approach is option 1. It avoids a custom review bot that would require secrets and comment-posting permissions, but still gives managed Bugbot repository context plus repeatable CI evidence for whitespace, dependency audit, type generation, build, dev/prod smoke, npm/pnpm lockfile stability, and the tracked OpenGraph asset.

## Architecture

- `.cursor/BUGBOT.md` is the single source of project-specific review guidance for Cursor Bugbot.
- `.github/workflows/ci.yml` runs the verification baseline on pull requests, `main`, and `cursor/**` automation branches.
- `scripts/smoke-dev-server.mjs` and `scripts/smoke-prod-server.mjs` start Next.js on dynamic ports, require HTTP 200, and shut down process groups cleanly.
- `scripts/next-dev-clean-env.mjs` restores production route types after dev server shutdown to avoid dirty `next-env.d.ts` churn.
- `package.json`, `package-lock.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` pin audited top-level dependencies and align npm/pnpm installs.
- `README.md` points contributors to the Bugbot guidance and CI baseline.
- Cursor's hosted Bugbot integration must be enabled outside the repository for pull request reviews to run automatically or by comment trigger.
- This branch deploys the rules only after its pull request is merged to the default branch; until then, Bugbot may not use these rules for unrelated pull requests.

## Components and Data Flow

1. A developer opens or updates a pull request.
2. CI installs dependencies, audits production packages, runs smoke helper tests, typechecks, builds, smoke-tests dev/prod servers, verifies pnpm, and checks generated-file stability.
3. Cursor Bugbot, once enabled for the repository, reads the pull request diff and the repository rules.
4. Bugbot uses the rules and CI evidence to post actionable review comments only for concrete issues it detects in changed code.

## Error Handling

If Bugbot does not run, the likely cause is integration configuration outside this repository: the GitHub repository is not connected in the Cursor dashboard, Bugbot is disabled for the repo, triggers are set to manual-only, required organization permissions are missing, or this rules file has not yet been merged to the default branch.

If CI fails, the failure should point to a concrete deployment invariant: whitespace, missing OpenGraph asset, dependency audit, smoke helper behavior, type generation, build, dev/prod HTTP smoke, pnpm install/audit, or generated file churn.

## Testing

Run the full deployment verification before completion:

- `git diff --check "$(git merge-base HEAD origin/main)"..HEAD`
- `test -f public/opengraph-image.png && git ls-files --error-unmatch public/opengraph-image.png`
- `npm ci`
- `npm audit --omit=dev`
- `npm run test:smoke`
- `npm run typecheck`
- `npm run build`
- `npm run smoke:dev`
- `npm run smoke:prod`
- `corepack enable && corepack pnpm install --frozen-lockfile`
- `corepack pnpm audit --prod`
- `git diff --exit-code -- next-env.d.ts package-lock.json pnpm-lock.yaml pnpm-workspace.yaml`
