# Cursor Bugbot review guide

Use this project-specific guide when reviewing pull requests for Hobgoblin Ruin Prototype. The repository is a Next.js app that hosts a Phaser 4 dungeon scene with generated pixel-art/audio assets.

## Managed-service verification

This file gives Cursor Bugbot repository context. It does not, by itself, prove that the managed Bugbot service is enabled.

When validating a deployment, check the external service boundaries:

- Cursor dashboard/org settings show Bugbot enabled for this repository.
- The Cursor/GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
- A pull request review smoke check confirms Bugbot can see the diff and post findings.

If dashboard or GitHub App access is unavailable, state that only repository review guidance and CI scaffolding were verified.

## Project map

- `src/app/page.tsx` mounts the client-only game canvas.
- `src/game/GameCanvas.tsx` creates and owns the Phaser game instance.
- `src/game/scenes/DungeonScene.ts` contains gameplay, input, spawning, combat, UI overlays, audio triggers, and most tuning constants.
- `src/game/maps/startingDungeon.ts` generates the room/corridor dungeon layout and collision-relevant tiles.
- `src/game/assets/manifest.ts` declares runtime asset keys, paths, sprite dimensions, and animation metadata.
- `public/assets/**` contains runtime sprites, sprite-sheet JSON, audio, and source/generated visual assets.
- `tools/**` and `scripts/**` contain generator/processor tooling for assets and procedural audio.

## Review priorities

1. **Runtime safety in the browser**
   - Phaser and browser globals must stay behind client boundaries. Do not introduce server-side imports that construct Phaser during Next.js rendering.
   - Clean up Phaser game instances, input handlers, tweens, timers, and audio objects when React remounts or the scene shuts down.
   - Guard against repeated scene creation, duplicate listeners, and stale object references after restart/game-over flows.

2. **Gameplay invariants**
   - Movement uses isometric tile coordinates and simple collision/proximity checks. Changes to tile math, pathing, or radius constants can break wall collision, enemy navigation, and camera follow.
   - Player health max is 3. Heart pickups restore missing hearts without increasing max health.
   - Standard ammo starts finite; ammo pickups reload. Seeker ammo is code-defined and unlocks after 4 kills or 30 seconds, with seeker pickups/projectiles thereafter.
   - Brutes unlock after 3 kills or 22 seconds. Verify spawn-pressure changes do not overwhelm early runs.
   - Power-ups are progression-gated in code: quickshot from start, haste after 1 kill or 12 seconds, blast after 2 kills or 16 seconds, and ward after 10 kills or 90 seconds.

3. **Controls and accessibility**
   - Current code binds keyboard firing to `SPACE` and pointer/click firing. Keep README controls and in-game instructions aligned with the active input bindings.
   - Start screen, how-to-play, mute, restart, and game-over interactions should work with the active input model and not trap players.

4. **Assets and manifests**
   - Runtime asset files referenced by `src/game/assets/manifest.ts` must exist under `public/assets/**`, with matching frame sizes and JSON metadata.
   - Avoid committing regenerated binary assets unless the associated manifest/tooling changes are included and the visual/runtime behavior is intentional.
   - Metadata or public asset references should point only at committed files; verify any newly referenced `public/**` assets exist.

5. **Performance and maintainability**
   - Be cautious with allocations in `update` loops, per-frame tweens, and particle/effect creation. Prefer existing pools and cleanup paths.
   - `DungeonScene.ts` is large; localized changes are preferred. Extract only when it clearly reduces risk for the touched behavior.
   - Keep tuning constants named and near related systems; avoid magic numbers inside hot gameplay methods.

6. **Documentation and CI**
   - If behavior changes, update README controls, power-up descriptions, known limitations, or asset notes as appropriate.
   - CI runs on pull requests, `main` pushes, and `cursor/**` automation branches; it should continue to run whitespace checks, dependency installation, audit, type generation/typecheck, build, and pnpm lockfile verification.

## Verification checklist for reviews

Ask for evidence appropriate to the diff:

- `git diff --check "$(git merge-base HEAD origin/main)"..HEAD`
- `npm ci`
- `npm audit --omit=dev`
- `npm run typecheck`
- `npm run build`
- `corepack enable`
- `corepack pnpm install --frozen-lockfile`
- `pnpm audit --prod`

For gameplay changes, also request a manual smoke pass:

- Start screen opens; how-to-play opens/closes.
- Movement works with WASD or arrows.
- Pointer aiming and click firing work; `SPACE` firing works.
- Ammo pickups, at least one power-up, damage, death/game-over, restart, and mute toggle behave as expected.
