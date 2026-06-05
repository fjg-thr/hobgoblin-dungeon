# Bugbot Review Rules

Use these project-specific rules when reviewing pull requests for the Hobgoblin Ruin Prototype.

## Project context

- This is a Next.js App Router project with strict TypeScript and a browser-only Phaser game scene.
- The React surface is intentionally small: `src/app/page.tsx`, `src/app/layout.tsx`, and `src/game/GameCanvas.tsx` boot a full-screen canvas game.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`; generated maps and tile semantics live in `src/game/maps/startingDungeon.ts`.
- Static sprite, audio, and metadata assets are served from `public/assets` and referenced through `src/game/assets/manifest.ts`.

## Review priorities

Prioritize actionable correctness issues over style-only comments.

1. **Client/server boundaries**
   - Flag any Phaser, `window`, `document`, pointer, audio, or canvas access that can run during server render.
   - Verify browser-only game code stays behind `"use client"`, `useEffect`, or dynamic imports.
   - Check that Phaser games, event listeners, timers, tweens, masks, and pooled objects are cleaned up when scenes or React components unmount.

2. **Strict TypeScript and data contracts**
   - Preserve `strict` TypeScript assumptions; flag unsafe casts, broad `any`, unchecked nullable values, or changes that bypass literal union types.
   - Check that asset manifest keys, metadata names, frame sizes, and animation row assumptions remain consistent with the code that consumes them.
   - Watch for duplicate string keys in Phaser caches; a changed asset key can break existing animations or sounds.

3. **Gameplay invariants**
   - Check map edits for out-of-bounds indexing, unreachable rooms, invalid spawn points, missing walls around playable tiles, and broken `TileCode` handling.
   - Check movement, projectile, pickup, power-up, enemy, health, score, ammo, and collision changes against the existing tile/world coordinate model.
   - Flag changes that can create runaway object growth, unlimited active tweens, uncapped spawns, stale pooled objects, or frame-rate-dependent simulation bugs.
   - Verify damage, invulnerability, cooldown, pickup radius, and difficulty timers preserve fair gameplay and cannot trigger repeatedly in the same frame unexpectedly.

4. **Assets and generated files**
   - If `public/assets` files change, verify matching manifest entries and JSON metadata are updated together.
   - If processing or generation scripts change, check that they still emit Phaser-compatible sprite sheets and do not overwrite unrelated generated assets.
   - Do not request large binary asset regeneration unless the PR intentionally changes visuals or audio.

5. **Next.js, React, and page metadata**
   - Preserve hydration-safe rendering and avoid reading mutable browser state while rendering React components.
   - Keep `metadataBase`, Open Graph, and Twitter metadata valid when environment variables are absent.
   - Do not suggest ShadCN, Tailwind, or component-library rewrites unless the PR explicitly introduces those dependencies; this project currently uses a custom canvas-first UI.

6. **Input, audio, and accessibility**
   - Check pointer, keyboard, and mute interactions for stuck state after blur, restart, game over, or scene transitions.
   - Flag audio changes that can play before user interaction or ignore the scene-level mute state.
   - For any non-canvas React controls added later, require semantic elements, keyboard access, and useful labels.

7. **Verification expectations**
   - For code changes, expect at least `npm run build` to pass.
   - For gameplay or UI changes, expect manual browser validation of the affected flow, including start screen, movement, combat, pickups, game over/restart, and mute behavior when relevant.
   - For map generation changes, expect repeat-run testing or targeted tests around bounds, blocked tiles, and spawn placement.

## Comment style

- Report concrete bugs, regressions, missing verification, or high-risk edge cases.
- Include the user-visible symptom and the path to reproduce when possible.
- Avoid comments that only request formatting, renaming, or architectural preference without a likely defect.
