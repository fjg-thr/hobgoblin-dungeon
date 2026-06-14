# Cursor Bugbot review guide

Use these repository notes when reviewing changes in Hobgoblin Ruin Prototype.

## Project shape

- Next.js App Router entry points live in `src/app`. The game is mounted by `src/app/page.tsx` through the client-only `src/game/GameCanvas.tsx`.
- `GameCanvas` dynamically imports Phaser and `DungeonScene` inside `useEffect` so Phaser does not run during server rendering. Preserve that client/server boundary.
- Most gameplay lives in `src/game/scenes/DungeonScene.ts`: Phaser preload/create/update work, input, HUD, audio, dungeon rendering, enemies, projectiles, pickups, power-ups, and cleanup.
- Dungeon generation and isometric constants live in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths and sprite metadata are centralized in `src/game/assets/manifest.ts`; files are served from `public/assets`.
- Asset/audio generation and processing tools are under both `tools/` and `scripts/`. Treat their outputs under `public/assets` as generated runtime assets.

## Review priorities

1. **Next/React boundaries**
   - Do not import Phaser-dependent scene code from server components or metadata files.
   - Keep browser-only APIs inside client components, effects, or Phaser scene methods.
   - Watch for generated Next type churn such as `next-env.d.ts` or `tsconfig.tsbuildinfo` unless the PR intentionally changes tooling.

2. **Phaser lifecycle and cleanup**
   - New scene event listeners, timers, tweens, input handlers, and long-lived sound objects need cleanup on scene shutdown or object destruction.
   - Changes to `GameCanvas` should still destroy the Phaser game in the React effect cleanup and avoid double-booting in Strict Mode.
   - Resize, pointer, keyboard, audio mute, and HUD objects should stay stable across restarts and scene shutdown.

3. **Gameplay invariants**
   - Preserve tile/world coordinate conversions, depth ordering, collision boxes, and spawn safety checks when changing movement, combat, pickups, or props.
   - Check ammo, seeker ammo, health, score, and power-up counters for caps, unlock gates, and stale HUD text.
   - Brute, seeker, blast, quickshot, haste, ward, heart, and ammo changes should be reviewed against their constants in `DungeonScene.ts`.
   - Avoid non-deterministic or unbounded object growth in update loops; prefer bounded pools or cleanup for particles, popups, effects, and projectiles.

4. **Assets and manifests**
   - New or renamed assets must update `assetManifest` and the matching files under `public/assets`.
   - Sprite-sheet frame dimensions, row indexes, frame ranges, and metadata JSON should agree with the code that loads and animates them.
   - Do not introduce dependency or lockfile churn for asset-only changes unless required by the generator being changed.

5. **UI, accessibility, and styling**
   - This repo currently uses semantic markup plus `src/app/globals.css`; it does not configure Tailwind.
   - Canvas UI interactions implemented inside Phaser should still have keyboard/pointer parity where practical and should not trap normal browser focus.
   - Metadata in `src/app/layout.tsx` references `/opengraph-image.png`; flag missing or intentionally changed share assets when relevant.

## Existing mismatches to account for

- `README.md` mentions `Space` or `J` for firing, but current code binds keyboard firing to `SPACE` and supports pointer/click firing. Do not block unrelated PRs solely for this existing mismatch; flag it only when controls docs or input bindings are in scope.
- The README omits seeker ammo, while current code unlocks seeker ammo after 4 kills or 30 seconds and uses seeker pickups/projectiles.
- The README calls blast a rare late-game power-up, while current code unlocks blast after 2 kills or 16 seconds.
- Generic Tailwind/ShadCN guidance does not apply unless a PR intentionally adds those tools.

## Suggested local checks

For code changes, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check "$(git merge-base HEAD origin/main)"..HEAD
```

`next lint` is listed in `package.json` but is not reliable with the current Next version. If verification generates `tsconfig.tsbuildinfo` or rewrites `next-env.d.ts`, ensure those artifacts are intentionally committed or restored before merge.

## Managed Cursor Bugbot activation boundary

This file provides repository-specific review context for Cursor Bugbot. It does not by itself prove that the managed Bugbot service is enabled. Confirm managed activation through Cursor dashboard/org settings, GitHub App repository access, and a pull request smoke check when those controls are available.
