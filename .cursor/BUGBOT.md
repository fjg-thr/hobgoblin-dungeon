# Cursor Bugbot review guide

Use this guide when reviewing changes in this repository. The project is a
Next.js App Router prototype that mounts a Phaser 4 game in a client-only React
component. Reviews should focus on runtime correctness, generated asset
integrity, and preserving the browser-only game boundary.

This file is repo-side review guidance only. Enabling or configuring the managed
Cursor Bugbot service for the repository is handled externally through Cursor
product settings and the relevant GitHub integration.

## Project shape

- `src/app/page.tsx` renders the game shell through `src/game/GameCanvas.tsx`.
- `GameCanvas` is the only React client boundary for Phaser. It dynamically
  imports `phaser` and `DungeonScene` inside `useEffect` so SSR never imports
  browser-only game code.
- `src/game/scenes/DungeonScene.ts` owns game state, input, combat, pickups,
  audio, and Phaser object lifecycles.
- `src/game/maps/startingDungeon.ts` owns dungeon generation, tile semantics,
  and collision/blocking rules.
- `src/game/assets/manifest.ts` is the source of truth for runtime asset paths,
  sprite dimensions, animation metadata, and audio file references.
- Visual and audio assets live under `public/assets/**`. Many are generated or
  post-processed by scripts under `tools/`.

## High-priority review areas

1. **Client/server boundary**
   - Do not allow direct top-level imports of Phaser or `DungeonScene` from
     server components or shared app files.
   - Keep browser APIs such as `window`, `document`, audio, pointer state, and
     Phaser constructors inside client-only code paths.
   - Ensure `GameCanvas` continues to clean up the Phaser game instance during
     React unmounts and Strict Mode remounts.

2. **Gameplay lifecycle**
   - Verify new timers, tweens, events, sounds, keyboard handlers, and pooled
     game objects are destroyed or reused safely.
   - Check game-over, restart, mute, and start-screen paths for leaked
     listeners or state that is not reset; include pause paths if a change
     introduces them.
   - For combat or movement changes, inspect collision math, projectile
     despawning, enemy path recalculation, invulnerability windows, and pickup
     gating together instead of reviewing each in isolation.

3. **Assets and manifest consistency**
   - Runtime asset paths in `assetManifest` must correspond to files in
     `public/assets/**`.
   - Sprite-sheet JSON metadata, frame sizes, row counts, and animation frame
     calculations must agree with the actual generated sheets.
   - If an asset generation script changes, confirm the generated artifacts and
     committed metadata changed together.
   - Avoid introducing remote runtime asset dependencies; this prototype should
     load committed local assets.

4. **Next.js metadata and routing**
   - `src/app/layout.tsx` declares OpenGraph/Twitter metadata. If metadata image
     paths change, verify the corresponding file exists under `public/` and that
     dimensions/alt text still match the asset.
   - The app currently has a single game route. Review new routes for App Router
     conventions and client/server boundaries.

5. **TypeScript and maintainability**
   - Keep TypeScript strict-mode friendly: avoid unnecessary `any`, unchecked
     casts, and nullable Phaser object access without a clear invariant.
   - Prefer small helpers only when they reduce real duplication in the large
     scene file. Do not introduce broad abstractions for one-off gameplay logic.
   - Preserve existing path aliases and package-manager lockfiles.

## Verification commands

Prefer these checks for pull requests that touch source, config, or assets:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
git diff --check origin/main...HEAD
```

Notes:

- `npm run lint` currently maps to `next lint`, which is not an integrated
  subcommand under the lockfile-resolved Next.js 16 build in this repository.
  Treat `npm run build` and `npx tsc --noEmit --incremental false` as the
  reliable automated checks until linting is migrated to an explicit ESLint
  setup.
- `next build` can refresh `next-env.d.ts` route type references. Do not leave
  generated churn in the working tree unless the Next/TypeScript configuration
  intentionally changed.
- Plain `npx tsc --noEmit` may create `tsconfig.tsbuildinfo` because
  `incremental` is enabled. Use `--incremental false` for review verification.

## Manual smoke checks for gameplay changes

When a change affects gameplay, assets, input, rendering, audio, or sizing, ask
for evidence from a browser smoke test:

- Page loads without SSR or hydration errors.
- Start screen enters gameplay and restart returns to a clean run.
- WASD/arrow movement, mouse aiming, click firing, Space firing, and F3 debug
  toggle still work.
- Ammo, heart pickups, quickshot, haste, ward, and blast behavior still match
  the README description when touched by the change.
- Seeker ammo and seeker projectile behavior are code-defined in
  `DungeonScene`; verify their unlock, pickup, and firing paths when touched.
- Audio starts only from user interaction, mute toggles all scene audio, and no
  console errors appear when restarting.

## Review output expectations

- Lead with concrete bugs, regressions, or missing verification. Include file
  and line references.
- Distinguish required fixes from optional polish.
- If a change only updates repository guidance or documentation, verify that it
  does not claim nonexistent files or checks and that it reflects the current
  project shape.
