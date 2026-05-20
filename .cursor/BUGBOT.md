# Cursor Bugbot Review Guidance

This file gives Cursor Bugbot repository-specific context for reviewing pull
requests in the Hobgoblin Ruin Prototype. It does not enable or disable the
managed Bugbot service by itself; service deployment is controlled through the
Cursor dashboard, organization settings, and GitHub App installation.

## Project shape

- This is a Next.js App Router project with a client-only Phaser game.
- `src/app/page.tsx` renders `src/game/GameCanvas.tsx`; `GameCanvas` is marked
  `"use client"` and dynamically imports Phaser plus `DungeonScene`.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`.
- Asset paths and frame metadata are centralized in `src/game/assets/manifest.ts`.
- Static assets live under `public/assets`; local asset/audio generators and
  processors live under both `tools/` and `scripts/`.

## Review priorities

1. Preserve the server/client boundary. Browser-only APIs, Phaser imports, and
   `window` access should stay behind client components or runtime dynamic
   imports.
2. Check Phaser lifecycle cleanup. Mount/unmount paths should keep working under
   React Strict Mode, and scene/game objects, timers, input handlers, tweens, and
   audio should not leak across restarts.
3. Protect gameplay invariants. Review movement, collision, camera follow,
   finite ammo, health capped at three hearts, score progression, pickup
   collection, enemy spawning, cooldowns, hit-stop, and power-up effects for
   regressions.
4. Verify asset consistency. When a PR changes sprite sheets, audio, generated
   assets, or manifest entries, ensure referenced files exist, frame sizes and
   rows match code expectations, and generated JSON stays in sync with the PNG
   or WAV assets.
5. Treat docs and code together. README control, power-up, and asset lists should
   be updated when the behavior or assets they describe change.
6. Review deployment metadata. `src/app/layout.tsx` references
   `/opengraph-image.png`; current checkouts may not include
   `public/opengraph-image.png`, so flag that on metadata/share-image changes
   without blocking unrelated gameplay PRs solely for the existing gap.

## Known repository context

- The GitHub repository is public even though `package.json` has
  `"private": true` for npm publishing.
- README currently says `Space` or `J` fires, while game code binds keyboard
  firing to `SPACE` and click firing. The in-game how-to text also says SPACE.
  Scope this mismatch to input/control documentation changes.
- README describes blast as a rare late-game power-up. Current code unlocks
  blast after 2 kills or 16 seconds (`POWERUP_CONFIG.blast`). Treat that as an
  existing docs/code mismatch unless a PR intentionally changes blast behavior.
- Current code unlocks seeker ammo after 4 kills or 30 seconds and uses seeker
  pickups/projectiles, but README does not describe seeker ammo yet.
- `npm run lint` currently maps to `next lint`; with the lockfile-resolved
  Next.js version this is not an integrated subcommand and fails as an invalid
  project directory. Prefer `npm run build` and
  `npx tsc --noEmit --incremental false` until linting is migrated.
- `npm ci` may report the current known audit state: 2 vulnerabilities
  (1 moderate, 1 high). Report new or changed security issues separately.
- `npm run build` can rewrite `next-env.d.ts` route-type paths. Revert that
  generated churn before clean-worktree verification unless the PR deliberately
  changes Next.js/TypeScript configuration.

## Managed Bugbot deployment checks

- Confirm Bugbot is enabled in the Cursor dashboard or organization settings for
  the GitHub repository, and that the Cursor GitHub App has access to the repo.
- Use a pull request smoke check to confirm Bugbot can read the diff and post or
  surface a review. This repository file only supplies project-specific review
  context; it is not proof that the managed service is enabled.
- If a reviewer cannot access the dashboard or GitHub App settings, state that
  limitation explicitly and verify only the repository guidance in this file.

## Expected verification for relevant PRs

- Run `npm ci` when dependency or lockfile state matters.
- Run `npm run build` for integration-level validation.
- Run `npx tsc --noEmit --incremental false` for side-effect-free TypeScript
  validation.
- For asset-heavy changes, inspect the affected manifest entries and generated
  metadata files in addition to the build.
- If verification cannot be run, explain why and identify the residual risk.

## Review output style

- Lead with actionable findings, ordered by severity.
- Include precise file and line references when possible.
- Distinguish shipped regressions from existing known limitations.
- Avoid blocking a PR solely for unrelated known gaps listed above.
