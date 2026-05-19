# Cursor Bugbot review guidance

Use this guide when reviewing changes in the Hobgoblin Ruin Prototype.

## Project shape

- This is a Next.js App Router project with React, TypeScript `strict` mode, and Phaser 4 RC for the browser game runtime.
- `src/app/page.tsx` renders the game shell. `src/game/GameCanvas.tsx` is the client-only boundary that dynamically imports Phaser and `DungeonScene`.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`; map generation lives in `src/game/maps/startingDungeon.ts`; asset paths and frame sizes live in `src/game/assets/manifest.ts`.
- Generated art, sprite metadata, and audio are stored under `public/assets`. Treat these files as runtime inputs, not incidental fixtures.

## High-value review areas

- Guard the server/client boundary. Phaser, `window`, input handling, audio, and canvas setup should remain behind `"use client"` and/or dynamic imports.
- Check Phaser lifecycle changes for duplicate game instances, leaked event listeners, uncleared timers, stale tweens, unbounded object pools, or sounds that continue after scene shutdown.
- Review gameplay constants together with their dependent logic. Spawning, pickups, power-up timing, invulnerability, hitboxes, ammo, and score changes can interact in non-obvious ways.
- For asset changes, verify that every manifest path has a matching file in `public/assets`, sprite-sheet frame sizes match their JSON metadata and Phaser loader calls, and generated source files are not confused with processed runtime sheets.
- `src/app/layout.tsx` references `/opengraph-image.png`; flag metadata/image changes if the referenced public asset is still missing or dimensions no longer match.
- Prefer deterministic tests or injectable randomness for map-generation changes. `createDungeon` accepts a random source; do not add new hard-coded `Math.random` seams when a dependency can be passed in.
- Watch for accidental large binary churn in generated assets. When asset updates are intentional, reviewers should still check that corresponding JSON metadata, manifests, and README asset lists stay synchronized.

## Verification expectations

Run these for normal code changes:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

Notes:

- `npm run build` is the main integration check because it exercises Next.js route/type generation and the production bundle.
- Use `npx tsc --noEmit --incremental false` for a side-effect-free TypeScript check. Plain `npx tsc --noEmit` can create `tsconfig.tsbuildinfo`.
- `npm run lint` currently invokes `next lint`; with the lockfile-resolved Next.js 16 toolchain this is not a valid integrated subcommand and fails by treating `lint` as a project directory. Do not require this command until linting is migrated to an explicit ESLint setup or another supported linter.
- Next build/type generation can rewrite `next-env.d.ts` with environment-specific route type paths. If that churn is unrelated to the reviewed change, it should be reverted before final checks.

## Manual smoke coverage

For gameplay or asset changes, request or perform a browser smoke test when possible:

- Load the start screen and begin a run.
- Move with WASD/arrow keys, aim with the pointer, and fire with Space/J and click.
- Toggle sound and confirm music/ambience mute state changes.
- Collect ammo, hearts, and each touched power-up type.
- Let enemies spawn, attack, die, and respawn; verify goblin/brute behavior and game-over/restart flows.
- Toggle the F3 debug overlay if collision, bounds, or map rendering changed.
