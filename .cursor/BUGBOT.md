# Bugbot review guide for Hobgoblin Ruin Prototype

Use these project notes when reviewing pull requests. Keep findings scoped to
changed code, but flag regressions against the invariants below.

## Project shape

- Next.js App Router app with React and TypeScript. The page mounts a Phaser 4
  game from `src/game/GameCanvas.tsx`.
- Main gameplay logic is in `src/game/scenes/DungeonScene.ts`; map generation is
  in `src/game/maps/startingDungeon.ts`; asset keys and public paths are in
  `src/game/assets/manifest.ts`.
- Static art, JSON sheet metadata, and audio live under `public/assets/**`;
  source/generator tooling lives under `tools/` and `scripts/`.

## Review priorities

1. **Client-only Phaser lifecycle**
   - Phaser must stay behind `"use client"` and dynamic `import()` boundaries.
   - Avoid touching `window`, `document`, `Phaser`, canvas, or audio APIs during
     server render/module evaluation.
   - Preserve React cleanup: destroy the Phaser game, stop timers/listeners, and
     guard async boot paths from mounting after unmount.

2. **DungeonScene state and gameplay invariants**
   - Restart/game-over/start-screen paths must reset run-scoped collections and
     flags: enemies, projectiles, pickups, powerups, cooldowns, text, tweens,
     input, audio, and debug overlays.
   - Combat changes should preserve hit-stop bounds, damage attribution,
     projectile/enemy cleanup, score updates, drops, and camera/depth ordering.
   - Movement/collision changes should keep tile/world conversion, radius checks,
     wall/chasm/bridge rules, and camera follow behavior aligned.

3. **Assets, manifests, and generated content**
   - New public assets need matching manifest entries, preload calls,
     animation/frame metadata, and README asset-list updates when user-facing.
   - Avoid generated binary churn unless intentional. If generated files change,
     verify the related `tools/` or `scripts/` processor/generator.
   - Frame width/height, rows, and keys must match JSON sheets and Phaser usage.

4. **UI, accessibility, and rendering**
   - Preserve keyboard access and avoid DOM overlays that trap focus or block
     pointer input without a game-state reason.
   - CSS should keep the canvas fullscreen, scrollbar-free, and pixel-art sharp.

5. **Performance and stability**
   - Watch for unbounded sprite/text/tween/particle allocations in `update()` or
     hot combat paths; prefer existing pooling/cleanup patterns.
   - Clamp delta-time jumps and avoid all-tiles/all-enemies work per frame unless
     bounded.
   - Audio/visual effects should respect mute/game-over state and not leak loops
     across restarts.

6. **Package and build safety**
   - `package-lock.json` and `pnpm-lock.yaml` are intentionally present.
     Dependency changes should keep both coherent or explain removal.
   - Do not introduce server-only Node APIs into client game code.

## Known existing mismatches

- README says `Space` or `J` fires; current code binds `Space` plus
  pointer/click only. Do not block unrelated PRs solely on this.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and
  blast, but code also has seeker ammo/projectiles that unlock after 4 kills or
  30 seconds.
- README calls blast rare late-game. Code unlocks blast after 2 kills or 16
  seconds with weight `42`; treat this as existing context unless changed.
- `src/app/layout.tsx` references `/opengraph-image.png`; metadata/CI changes
  should confirm that asset or intentionally change the reference.

## Suggested verification

For most code changes, ask contributors to run:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Notes:

- `npm run lint` calls `next lint`, which is not reliable with this Next 16
  setup. Prefer build plus `tsc --noEmit` unless fixing lint tooling.
- Next build/typecheck can rewrite `next-env.d.ts` or create
  `tsconfig.tsbuildinfo`; avoid committing those generated artifacts unless the
  PR intentionally changes TypeScript/Next generated type behavior.
- Runtime behavior changes also need a browser smoke check at
  `http://localhost:3000`: start, movement, firing, contact damage, pickups,
  restart, mute, and debug toggle.

## Managed Bugbot deployment boundary

This file gives Bugbot project-specific review context. It does not enable the
managed Cursor Bugbot service by itself. Confirm managed deployment outside the
repo through Cursor dashboard/org settings, GitHub App repository access, and a
pull-request review smoke trigger when those controls are available.
