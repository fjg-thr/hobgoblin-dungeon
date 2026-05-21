# Cursor Bugbot review guidance

Use this file as repository-specific context when Cursor Bugbot reviews pull requests for the Hobgoblin Ruin prototype.

## Managed Bugbot deployment boundary

- This repository file gives Bugbot review context only. Enabling, disabling, or scheduling the managed Cursor Bugbot service is handled outside the repository through Cursor product, dashboard, or organization settings.
- To verify managed deployment, confirm the Cursor dashboard or org settings show Bugbot enabled for this repository, confirm the GitHub App has repository access, then open or update a pull request and confirm Bugbot posts a review.
- If you only have access to repository files, report that the guidance is deployed but managed-service enablement still needs external verification.

## Project profile

- Stack: Next.js App Router with React, TypeScript, and Phaser 4.
- The app is a single full-screen game surface in `src/app/page.tsx` and `src/game/GameCanvas.tsx`, with most gameplay behavior in `src/game/scenes/DungeonScene.ts`.
- Styling is plain global CSS in `src/app/globals.css`. Do not ask for Tailwind or ShadCN changes unless a pull request intentionally adds those dependencies and conventions.
- Asset metadata and paths live in `src/game/assets/manifest.ts`, with generated art, audio, and JSON metadata under `public/assets`.
- Map generation and tile semantics live in `src/game/maps/startingDungeon.ts`.

## Review priorities

- Treat gameplay regressions as high impact: movement, collision, camera follow, combat, pickups, power-ups, scoring, audio mute, start/game-over flows, and debug toggles should keep working together.
- Check Phaser lifecycle cleanup for any added event listeners, timers, tweens, pooled objects, or scene objects. Shutdown/restart leaks are easy to miss in this prototype.
- Preserve type safety. Avoid broad `any`, unchecked asset keys, and changes that desynchronize TypeScript unions from manifest data.
- For asset changes, verify PNG dimensions, frame widths/heights, frame counts, animation row assumptions, JSON metadata, and manifest keys stay aligned.
- Keep generated asset changes intentional. Generator and processor tooling lives in both `tools/` and `scripts/`; do not assume all generated assets come from one folder.
- Watch performance-sensitive scene code. Per-frame updates should avoid unnecessary allocation or full-list scans beyond the current small prototype constraints.
- Review accessibility and metadata for the Next.js shell, but remember the main interactive surface is a Phaser canvas game.

## Known repository context

- `package.json` is marked `"private": true` for npm publishing, but the GitHub repository is public.
- `npm run lint` currently invokes `next lint`, which is not an integrated subcommand under the lockfile-resolved Next.js 16.2.4 setup. Prefer `npm run build` and `npx tsc --noEmit --incremental false` until linting is migrated to an explicit ESLint command/configuration.
- `npm ci` may report the existing audit state of 2 vulnerabilities total, 1 moderate and 1 high. Mention this as verification context unless the pull request changes dependencies or security posture.
- Next build/type-check commands can update generated files such as `next-env.d.ts` or create `tsconfig.tsbuildinfo`. Do not include that churn in unrelated PRs.
- `src/app/layout.tsx` references `/opengraph-image.png`; `public/opengraph-image.png` is a live share-card invariant and should remain tracked.
- README controls mention `Space` or `J`, but current code binds shooting to `SPACE` and pointer/click only. Flag this only when a PR touches controls, docs, or input behavior; do not block unrelated PRs solely for the existing mismatch.
- README describes blast as a rare late-game power-up, but current code unlocks blast after 2 kills or 16 seconds. Treat that as an existing docs/code mismatch unless a PR intentionally addresses progression.
- Seeker ammo is code-defined behavior that unlocks after 4 kills or 30 seconds and uses seeker pickups/projectiles; README does not currently document it.

## Suggested verification for relevant PRs

- Install: `npm ci`
- Build: `npm run build`
- Type check: `npx tsc --noEmit --incremental false`
- Asset/config spot checks when assets change:
  - Confirm changed asset files exist under `public/assets`.
  - Confirm corresponding manifest paths and JSON metadata reference the same dimensions and frame counts.
  - Confirm `public/opengraph-image.png` remains present and tracked when metadata or public assets change.
- Whitespace and generated-file hygiene:
  - `git diff --check origin/main...HEAD`
  - `git diff --check`
  - `git diff --exit-code` after verification cleanup

## Review tone

- Lead with concrete bugs and risks, grounded in file and line references.
- Distinguish new regressions from existing limitations documented above.
- Keep suggestions scoped to the pull request. Avoid broad rewrites of the Phaser scene unless the change already touches that area and the risk justifies it.
