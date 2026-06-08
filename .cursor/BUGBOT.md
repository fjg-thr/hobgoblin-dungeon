# Cursor Bugbot review guide

Use this project-specific guide when reviewing pull requests for Hobgoblin Ruin Prototype, a Next.js app that mounts a Phaser 4 dungeon scene with generated pixel-art/audio assets.

## Managed-service boundary

This file gives Bugbot repository context only. It does not prove the managed service is enabled. To validate deployment, confirm Cursor dashboard/org settings, GitHub App access to `fjg-thr/hobgoblin-dungeon`, and a PR review smoke check. If those are unavailable, state that only repo guidance and CI were verified.

## Deployment baseline

Package versions use committed npm/pnpm lockfiles and audited pinned top-level dependencies in CI. Next.js is patched to audited `16.2.6`; treat that as dependency hardening and ask for build/start smoke evidence when reviewing baseline changes.

## Project map

- `src/app/page.tsx`: client-only game canvas entry.
- `src/game/GameCanvas.tsx`: Phaser game lifecycle owner.
- `src/game/scenes/DungeonScene.ts`: gameplay, input, spawning, combat, UI, audio, and most tuning.
- `src/game/maps/startingDungeon.ts`: dungeon generation and collision-relevant tiles.
- `src/game/assets/manifest.ts`: runtime asset keys, paths, dimensions, animation metadata.
- `public/assets/**`: sprites, sprite-sheet JSON, audio, source/generated assets.
- `tools/**` and `scripts/**`: asset/audio generator and processor tooling.

## Review priorities

1. **Browser/runtime safety**
   - Keep Phaser/browser globals behind client boundaries; avoid server-side imports that construct Phaser during Next.js rendering.
   - Clean up Phaser games, listeners, tweens, timers, and audio objects across React remounts, scene shutdown, restart, and game-over flows.

2. **Gameplay invariants**
   - Movement, collision, enemy navigation, and camera follow depend on isometric tile math plus simple proximity checks.
   - Player max health is 3; heart pickups restore missing hearts only.
   - Standard ammo is finite and pickup-reloaded. Seeker ammo is code-defined and unlocks after 4 kills or 30s.
   - Brutes unlock after 3 kills or 22s; avoid overwhelming early spawn pressure.
   - Power-ups are code-gated: quickshot from start, haste after 1 kill/12s, blast after 2 kills/16s, ward after 10 kills/90s.

3. **Controls and UI**
   - Current code fires with `SPACE` and pointer/click. README also mentions `J`; treat that as existing doc debt unless a PR touches controls/docs.
   - Start, how-to-play, mute, restart, and game-over interactions must remain reachable and not trap input.

4. **Assets and metadata**
   - Assets referenced by `src/game/assets/manifest.ts` must exist under `public/assets/**` with matching frame sizes/JSON.
   - Commit regenerated binary assets only with intentional manifest/tooling changes.
   - `src/app/layout.tsx` references `/opengraph-image.png`; keep `public/opengraph-image.png` tracked.

5. **Maintainability**
   - Be cautious with per-frame allocations, tweens, and effect creation; prefer existing pools/cleanup paths.
   - `DungeonScene.ts` is large. Prefer localized changes; extract only when it reduces risk for the touched behavior.
   - Keep tuning constants named and near related systems.

6. **Docs and CI**
   - Update README when controls, power-ups, limitations, or assets change.
   - CI should keep whitespace, install, audit, typegen/typecheck, build, dev/prod HTTP smoke, pnpm, and generated-file stability checks.

## Verification evidence

Ask for checks appropriate to the diff:

- `git diff --check "$(git merge-base HEAD origin/main)"..HEAD`
- `test -f public/opengraph-image.png && git ls-files --error-unmatch public/opengraph-image.png`
- `npm ci && npm audit --omit=dev`
- `npm run test:smoke && npm run typecheck && npm run build`
- `npm run smoke:dev` for HTTP 200 dev smoke, graceful stop, and clean `next-env.d.ts`
- `npm run smoke:prod` for dynamic-port HTTP 200 production smoke after build
- `corepack pnpm install --frozen-lockfile && corepack pnpm audit --prod`
- `git diff --exit-code -- next-env.d.ts package-lock.json pnpm-lock.yaml pnpm-workspace.yaml`

For gameplay changes, smoke start/how-to-play, movement, pointer/click and `SPACE` firing, pickups, damage, death/restart, and mute.
