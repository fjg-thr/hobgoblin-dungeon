# Cursor Bugbot review guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin Prototype.

## Repository context

- This is a Next.js App Router project using React, TypeScript strict mode, and Phaser 4.0.0-rc.4.
- The playable game is mounted from `src/app/page.tsx` through `src/game/GameCanvas.tsx`.
- Phaser must remain isolated to client-side execution. Keep the `"use client"` boundary and dynamic `import("phaser")` / `import("./scenes/DungeonScene")` pattern in `GameCanvas`.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`; dungeon layout helpers live in `src/game/maps/startingDungeon.ts`; asset paths and sprite-sheet dimensions live in `src/game/assets/manifest.ts`.
- Art, audio, and sprite-sheet metadata under `public/assets/**` are part of the runtime contract, not just static decoration.

## High-priority review checks

1. Client/server boundaries
   - Flag direct Phaser imports from server components, metadata files, or other code that can run during SSR.
   - Check that browser globals such as `window`, `document`, and Phaser APIs stay inside client-only effects or Phaser scene methods.
   - Confirm scene shutdown and React effect cleanup still destroy the Phaser game and unregister scene input listeners.

2. Gameplay state and lifecycle
   - Review `DungeonScene` changes for start-screen, how-to, active-run, game-over, and restart state transitions.
   - Check that input handlers do not stack after restarts or scene shutdown.
   - Keyboard firing is currently bound to `Space`; pointer click also aims and fires. The README also mentions `J`, but `DungeonScene` does not currently bind `J`, so flag changes that widen or preserve that mismatch without implementation or documentation updates.
   - There is no separate pause flow today. Do not assume Escape pauses gameplay; it only closes the how-to modal before the run starts.

3. Combat, pickups, and progression
   - Verify projectile cooldowns, ammo consumption, seeker ammo, blast-charged shots, enemy damage, and hit cleanup remain internally consistent.
   - Confirm pickup spawn rules respect max ammo, seeker unlock rules, missing-heart restoration, and progression-gated power-ups.
   - Look for stale sprites, timers, tweens, sounds, or arrays that survive game over, restart, or scene shutdown.

4. Dungeon, collision, and rendering
   - Check tile-space vs world-space conversions carefully. Movement, projectiles, enemy pathing, props, shadows, depth sorting, labels, and collision boxes depend on consistent coordinates.
   - Flag edits that make blocking props, walls, chasms, or bridges visually disagree with collision.
   - Debug overlays (`F3`) should remain accurate when map generation, blockers, or prop placement changes.

5. Assets and manifests
   - When an asset path, frame size, animation range, or generated sheet changes, verify the corresponding files under `public/assets/**` and metadata JSON are updated together.
   - Confirm new public assets are referenced with root-relative `/assets/...` paths that Next can serve.
   - Avoid accepting manifest-only changes for assets that are not present in `public/assets`.
   - `src/app/layout.tsx` currently references `/opengraph-image.png`, but this repository may not include `public/opengraph-image.png`. If metadata or sharing images are touched, require the file to be added, the reference to be changed, or the missing-asset state to be explicitly intentional.

6. TypeScript and maintainability
   - Preserve strict TypeScript types, narrow union types, and existing helper patterns.
   - Prefer focused helpers over adding broad abstractions to the large scene file.
   - Avoid introducing dependencies for logic that can use the existing Next/React/Phaser/TypeScript stack.

## Verification to request or run

- `npm ci`
- `npm run build`
- `npx tsc --noEmit --incremental false`
- Asset/config spot checks when manifests or generated files change.
- Manual smoke test for gameplay-facing changes: start a run, move with WASD/arrows, aim with mouse, fire with Space and click, collect ammo/power-ups/hearts, verify seeker ammo if relevant, toggle sound, toggle `F3`, die, and restart.

The current `npm run lint` script invokes `next lint`, which is not an integrated command in the lockfile-resolved Next.js 16.2.4 setup and fails as if `lint` were a project directory. Prefer the build and TypeScript commands above until linting is migrated to an explicit supported tool.

## Review output expectations

- Prioritize bugs, regressions, missing tests, and broken runtime assets over style-only feedback.
- Cite exact files and lines where possible.
- If a change is documentation-only or guidance-only, verify that it does not claim nonexistent runtime behavior.
- If no issues are found, say so clearly and mention any residual test or manual-smoke-test gaps.
