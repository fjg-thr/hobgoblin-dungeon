# Cursor Bugbot review guidance

Use this file as repository-specific context when reviewing pull requests for the Hobgoblin Ruin prototype.

## Project shape

- Next.js App Router application with a small React shell in `src/app` and `src/game/GameCanvas.tsx`.
- The game runtime is Phaser, loaded only on the client through the dynamic imports in `GameCanvas`.
- Most gameplay state, rendering, collision, combat, audio, and HUD behavior lives in `src/game/scenes/DungeonScene.ts`.
- Dungeon topology and tile blocking helpers live in `src/game/maps/startingDungeon.ts`.
- Asset paths and sprite-sheet dimensions are centralized in `src/game/assets/manifest.ts`; generated assets live under `public/assets`.
- Asset-generation scripts under `tools/` and `scripts/` are developer utilities, not runtime code.

## Review priorities

1. **Client/server boundary**
   - Flag changes that import Phaser, browser globals, or game-scene code into Server Components.
   - `GameCanvas` should remain a client component and should continue to destroy the Phaser game on unmount.
   - Metadata and layout code in `src/app/layout.tsx` must stay server-safe.

2. **Gameplay correctness**
   - Check collision, pathfinding, and pickup changes against `startingDungeon.ts` tile semantics.
   - Watch for per-frame allocations or unbounded arrays in `DungeonScene.update` paths.
   - Confirm timers, cooldowns, invulnerability windows, drops, and enemy caps remain deterministic enough for playtesting.
   - Verify game-over, restart, mute, debug-overlay, and input handling still work after gameplay edits.

3. **Asset contract**
   - New runtime assets should be declared in `assetManifest` and exist under `public/assets`.
   - Sprite frame sizes, row counts, animation keys, and JSON metadata should match the generated sheet files.
   - Avoid hard-coded public asset paths in gameplay code when a manifest entry is appropriate.

4. **TypeScript and React quality**
   - Preserve strict TypeScript compatibility and avoid `any` unless a Phaser type gap is documented locally.
   - Keep React code focused on mounting the game shell; avoid moving Phaser scene state into React state.
   - Prefer small, named helpers when editing complex scene behavior instead of adding more large inline blocks.

5. **Build and dependency hygiene**
   - Treat dependency changes as high-risk; this project intentionally uses Next/React latest and Phaser 4 RC.
   - Do not add duplicate package-manager workflows. The repository currently contains both npm and pnpm lockfiles, but verification should use npm unless the branch intentionally changes that.
   - Do not rely on `npm run lint` until the script is updated for the locked Next CLI; `next lint` is not available in the current Next 16 CLI.

## Suggested verification

Run these checks for code changes when feasible:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check
```

Notes:

- `npm ci` may report existing audit findings; do not treat unchanged audit output as a regression without dependency edits.
- `npm run build` may refresh `next-env.d.ts`; only commit that file when the change is intentional.
- `npx tsc --noEmit` may create `tsconfig.tsbuildinfo`; remove it unless it is intentionally tracked.

## Common false positives to avoid

- Dynamic importing Phaser from the client component is intentional and prevents server-side evaluation of browser-only code.
- The Open Graph image referenced from `layout.tsx` should either exist at `public/opengraph-image.png` or be replaced with a valid App Router metadata image route.
- Generated image/audio assets can be large; focus review on whether metadata and manifest references are consistent.
- The debug overlay and F3 toggle are intentional playtest tooling.

## Escalate

Escalate to a human reviewer when a change affects combat balance, map generation rules, asset pipeline scripts, dependency versions, or public metadata/SEO behavior.
