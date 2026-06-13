# Cursor Bugbot Review Instructions

Use this file as repository-specific context when reviewing pull requests for the Hobgoblin Ruin Prototype. The managed Bugbot service, GitHub App access, and Cursor dashboard settings are configured outside this repository; this file only supplies review guidance.

## Project context

- This is a Next.js app package with React, TypeScript, and a Phaser 4 game scene.
- The playable surface is primarily `src/game/scenes/DungeonScene.ts`, rendered through `src/game/GameCanvas.tsx` and `src/app/page.tsx`.
- Styling is plain CSS in `src/app/globals.css`; Tailwind and ShadCN are not configured in this repo.
- Assets live under `public/assets`. Generator and processor tooling lives under both `tools/` and `scripts/`.
- The package intentionally has no `npm start` script. Prefer build and type checks unless a PR adds explicit smoke-test infrastructure.

## Review priorities

1. Preserve game boot and rendering behavior:
   - `GameCanvas` must remain client-only and dynamically import Phaser.
   - Phaser scenes should clean up input listeners, timers, tweens, and game instances on shutdown/unmount.
   - Browser-only APIs must not run during Next server rendering.
2. Protect gameplay invariants:
   - Movement uses isometric WASD/arrow input.
   - Shooting is implemented with `Space` and pointer/click firing in code. The README currently also mentions `J`; do not block unrelated PRs solely for that existing docs/code mismatch.
   - Ammo is finite. Standard ammo, seeker ammo, heart pickups, quickshot, haste, ward, and blast all have separate progression and UI implications.
   - Existing README/code mismatches around seeker ammo and blast timing should be called out only when the PR touches those systems or claims to document them.
3. Watch asset and metadata changes carefully:
   - If `src/app/layout.tsx` references `/opengraph-image.png`, verify `public/opengraph-image.png` exists and is tracked.
   - Generated or processed assets should be reproducible from the matching `tools/` or `scripts/` command, or the PR should explain why a source-only/manual asset is intentional.
   - Do not accept broken manifest references in `src/game/assets/manifest.ts`; every referenced public asset should exist.
4. Keep dependency/tooling changes scoped:
   - Dependency or lockfile churn should have a clear reason and should update the matching lockfiles consistently.
   - Do not suggest `next lint` as the primary verification path; this repo's current Next setup does not make it reliable.
   - Avoid adding CI, package scripts, or runtime infrastructure unless the PR is explicitly about tooling.

## Suggested verification

For most code PRs:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check origin/main...HEAD
```

For asset or metadata PRs, also verify referenced files:

```bash
git ls-files --error-unmatch public/opengraph-image.png
```

Adjust the asset command to the specific files touched by the PR. If verification generates `.next/`, `next-env.d.ts`, or `tsconfig.tsbuildinfo` changes, separate intentional source changes from generated local artifacts before approving.

## Managed Bugbot deployment checks

When asked to confirm that Bugbot is deployed for code review, verify these outside the repository if you have access:

1. Cursor organization or workspace settings have Bugbot/code review enabled.
2. The Cursor GitHub App is installed for `fjg-thr/hobgoblin-dungeon`.
3. A test pull request receives a Bugbot review or check.

If those settings are unavailable from the agent environment, state that repository guidance is present but managed-service enablement could not be proven from repo files alone.
