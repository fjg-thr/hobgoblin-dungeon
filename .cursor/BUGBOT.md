# Bugbot review guide for Hobgoblin Ruin Prototype

Use these project notes when reviewing pull requests. Keep findings scoped to the
changed code, but call out regressions that affect the invariants below.

## Project shape

- Next.js App Router app with React and TypeScript. The page mounts a Phaser 4
  game from `src/game/GameCanvas.tsx`.
- Main gameplay logic is in `src/game/scenes/DungeonScene.ts`; map generation is
  in `src/game/maps/startingDungeon.ts`; asset keys and public paths are in
  `src/game/assets/manifest.ts`.
- Static art, JSON sheet metadata, and audio live under `public/assets/**`.
  Source/generator tooling lives under both `tools/` and `scripts/`.

## Review priorities

1. **Client-only Phaser lifecycle**
   - Phaser must stay behind `"use client"` and dynamic `import()` boundaries.
   - Avoid touching `window`, `document`, `Phaser`, canvas, or audio APIs during
     server render/module evaluation.
   - Preserve cleanup in React effects: destroy the Phaser game, stop timers,
     remove input listeners, and guard async boot paths from mounting after
     unmount.

2. **DungeonScene state and gameplay invariants**
   - Check that restart/game-over/start-screen paths reset every run-scoped
     collection and flag: enemies, projectiles, pickups, active powerups,
     cooldowns, text, tweens, input state, audio state, and debug overlays.
   - Combat changes should preserve hit-stop bounds, damage source attribution,
     projectile cleanup, enemy death cleanup, score updates, pickup drops, and
     camera/depth ordering.
   - Movement/collision changes should keep tile/world conversion, player
     radius checks, wall/chasm/bridge rules, and camera follow behavior aligned.
   - Current keyboard firing is bound to `Space`; pointer/click also fires. The
     README mentions `J`, but this is an existing docs/code mismatch unless the
     PR intentionally changes controls.

3. **Assets, manifests, and generated content**
   - Any new public asset should have a matching manifest entry, preload call,
     animation/frame metadata, and README asset-list update when user-facing.
   - Keep generated binaries out of code-review churn unless the PR is
     intentionally regenerating assets. If generated files change, verify the
     relevant processor/generator in `tools/` or `scripts/` still documents how
     to reproduce them.
   - Metadata such as frame width, height, rows, and keys must match both the
     JSON sheet files and Phaser load/anims usage.

4. **UI, accessibility, and rendering**
   - The web app is a fullscreen game surface; preserve keyboard access for
     controls and avoid adding DOM overlays that trap focus or block pointer
     input without an explicit game-state reason.
   - CSS should keep the canvas filling the viewport without scrollbars and
     should preserve pixel-art rendering.

5. **Performance and stability**
   - Look for unbounded sprite/text/tween/particle allocations in `update()` or
     hot combat paths. Prefer pooling or explicit cleanup where the scene already
     uses it.
   - Clamp large delta-time jumps and avoid adding work that scales with all
     tiles/enemies every frame unless bounded.
   - Audio and visual effects should respect mute/game-over/pause style state
     and should not leak loops across restarts.

6. **Package and build safety**
   - Treat `package-lock.json` and `pnpm-lock.yaml` as intentionally present.
     Dependency changes should keep both lockfiles coherent or explain why one
     package manager is being removed.
   - Do not introduce server-only Node APIs into client game code.

## Known existing mismatches

- README says `Space` or `J` fires, while the current scene binds firing to
  `Space` and pointer/click only. Do not block unrelated PRs solely on this.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and
  blast, but code also has seeker ammo/projectiles that unlock after 4 kills or
  30 seconds.
- README describes blast as rare late-game. Current code unlocks blast after 2
  kills or 16 seconds with weight `42`; treat this as existing context unless a
  PR intentionally updates power-up progression.
- `src/app/layout.tsx` references `/opengraph-image.png`; if metadata or CI is
  touched, confirm that asset exists or that the reference is intentionally
  changed.

## Suggested verification

For most code changes, ask contributors to run:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Notes:

- `npm run lint` currently calls `next lint`, which is not reliable with this
  Next 16 setup. Prefer build plus `tsc --noEmit` unless lint tooling is being
  fixed in the PR.
- Next build/typecheck can rewrite `next-env.d.ts` or create
  `tsconfig.tsbuildinfo`; avoid committing those generated artifacts unless the
  PR intentionally changes TypeScript/Next generated type behavior.
- If runtime behavior changes, also do a browser smoke check at
  `http://localhost:3000`: start screen, movement, firing, enemy contact damage,
  pickup collection, restart, mute toggle, and debug toggle.

## Managed Bugbot deployment boundary

This repository file gives Bugbot project-specific review context. It does not
enable the managed Cursor Bugbot service by itself. Confirm managed deployment
outside the repo by checking Cursor dashboard/org settings, GitHub App access to
this repository, and a pull-request review smoke trigger when those controls are
available.
