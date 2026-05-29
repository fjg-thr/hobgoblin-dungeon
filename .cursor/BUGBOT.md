# Cursor Bugbot review guide

Use this project-specific guide when reviewing pull requests for Hobgoblin Ruin Prototype. The repository is a Next.js App Router app that hosts a Phaser 4 dungeon scene with generated pixel-art and audio assets.

## Deployment boundary

- This file supplies repository-specific review context for Cursor Bugbot.
- Managed Bugbot enablement is configured outside this repository in the Cursor dashboard, organization settings, and GitHub App repository access.
- When validating deployment, confirm the Cursor GitHub integration has access to `fjg-thr/hobgoblin-dungeon`, Bugbot is enabled for the repository, and a pull request smoke check can trigger a review.
- If dashboard or GitHub App access is unavailable, state that only repository review guidance was verified.

## Project map

- `src/app/page.tsx` mounts the game canvas through React.
- `src/game/GameCanvas.tsx` creates and owns the Phaser game instance.
- `src/game/scenes/DungeonScene.ts` contains gameplay, input, spawning, combat, UI overlays, audio triggers, and most tuning constants.
- `src/game/maps/startingDungeon.ts` generates the room/corridor dungeon layout and collision-relevant tiles.
- `src/game/assets/manifest.ts` declares runtime asset keys, paths, sprite dimensions, and animation metadata.
- `public/assets/**` contains runtime sprites, sprite-sheet JSON, audio, and generated/source visual assets.
- `tools/**` and `scripts/**` contain generator and processor tooling for assets and procedural audio.

## Review priorities

1. **Runtime safety in the browser**
   - Phaser and browser globals must stay behind client boundaries. Flag server components or shared modules that import Phaser in a way that can execute during Next.js rendering.
   - Check that React remounts and Phaser scene shutdown/restart paths clean up game instances, input handlers, tweens, timers, particles, audio handles, and display objects.
   - Look for duplicate listeners, repeated scene creation, stale object references, and unsafe access to destroyed Phaser objects.

2. **Gameplay invariants**
   - Movement uses isometric tile coordinates and simple collision/proximity checks. Changes to tile math, pathing, or radius constants can break wall collision, enemy navigation, and camera follow.
   - Player health max is 3. Heart pickups should restore missing hearts without increasing max health.
   - Standard ammo starts finite and ammo pickups reload it. Seeker ammo unlocks during a run and should not make standard ammo, pickup limits, or projectile cleanup inconsistent.
   - Brutes and power-ups are progression-gated. Verify spawn-pressure and unlock changes do not overwhelm early runs or create impossible states.
   - Flag gameplay changes that can create negative health or ammo, invulnerable enemies, permanent input lockout, endless spawning, non-expiring power-ups, or pickups that cannot be collected.

3. **Controls, UI, and accessibility**
   - Current code binds keyboard firing to `SPACE` and pointer/click firing. The README also mentions `J`; treat that as pre-existing documentation debt unless a PR intentionally changes controls or docs.
   - Start screen, how-to-play, mute, restart, and game-over interactions should continue to work with the active input model and not trap players.
   - React UI changes should keep semantic elements, labels for interactive controls, keyboard support, and visible focus behavior.

4. **Assets and manifests**
   - Runtime asset files referenced by `src/game/assets/manifest.ts` must exist under `public/assets/**`, with matching frame sizes, frame names, JSON metadata, and file paths.
   - Avoid approving regenerated binary assets unless the associated manifest, source asset, or tooling changes are included and the visual/runtime behavior is intentional.
   - `src/app/layout.tsx` references `/opengraph-image.png`; keep `public/opengraph-image.png` tracked when touching metadata or public assets.
   - Preserve pixel-art assumptions such as nearest-neighbor scaling and transparent/chroma-key processing unless a PR is explicitly changing the art pipeline.

5. **Performance and maintainability**
   - Be cautious with allocations in Phaser `update` loops, per-frame tweens, and particle/effect creation. Prefer existing pools and cleanup paths.
   - `DungeonScene.ts` is large; localized changes are preferred. Extract only when it clearly reduces risk for the touched behavior.
   - Keep tuning constants named and near related systems. Avoid magic numbers inside hot gameplay methods.

6. **Documentation and verification**
   - If behavior changes, check whether README controls, power-up descriptions, known limitations, asset notes, or `ASSET_PROMPTS.md` need updates.
   - For app or TypeScript changes, expect evidence that `npm run build` passes.
   - For dependency or lockfile changes, expect `npm ci` and a production dependency audit when practical.
   - For asset pipeline changes, expect the relevant `npm run process:*` or `npm run generate:*` script, or a clear manual verification note if the generator cannot be run.

## Verification checklist for reviews

Ask for evidence appropriate to the diff:

- `git diff --check "$(git merge-base HEAD origin/main)"..HEAD`
- `npm ci`
- `npm audit --omit=dev`
- `npm run build`
- `test -f public/opengraph-image.png && git ls-files --error-unmatch public/opengraph-image.png`

For gameplay changes, also request a manual smoke pass:

- Start screen opens; how-to-play opens and closes.
- Movement works with WASD or arrows.
- Pointer aiming and click firing work; `SPACE` firing works.
- Ammo pickups, at least one power-up, damage, death/game-over, restart, and mute toggle behave as expected.
