# Cursor Bugbot Review Guide

Use this guide when reviewing changes in this repository. Keep findings scoped to
the behavior touched by the pull request, and call out existing mismatches only
when the PR makes them worse or claims to fix them.

## Project shape

- Next.js App Router renders `src/app/page.tsx`, which mounts the client-only
  `src/game/GameCanvas.tsx`.
- `GameCanvas` dynamically imports Phaser and `src/game/scenes/DungeonScene.ts`
  so Phaser stays out of server rendering. Preserve the `"use client"` boundary
  and the cleanup that destroys the Phaser game on unmount.
- Core gameplay is in `DungeonScene.ts`; map generation and tile collision
  helpers live in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths are centralized in `src/game/assets/manifest.ts` and
  should match files under `public/assets`.
- Asset generator/processor tooling lives under both `tools/` and `scripts/`.
  Generated sprites, metadata, and audio should not change accidentally.

## Review priorities

1. **Client/server boundaries:** flag any static Phaser import from server
   components or shared modules that can run during SSR.
2. **Phaser lifecycle:** check that input listeners, timers, tweens, pooled
   objects, audio, and scene shutdown handlers are cleaned up or naturally owned
   by the active scene.
3. **Gameplay invariants:** verify movement/collision, enemy pathing, projectile
   lifetime, ammo, power-up unlocks, health, score, pause/start/game-over states,
   and debug toggles after behavior changes.
4. **Asset consistency:** new assets need matching manifest entries, dimensions,
   metadata, preload usage, and committed runtime files. Generated source files
   should be intentional.
5. **UI/accessibility basics:** React-facing UI should remain keyboard and screen
   reader friendly where applicable. Phaser-only overlays should at least avoid
   trapping normal page interaction.

## Known existing mismatches

- README says `Space` or `J` fires. Current code binds keyboard shooting to
  `Space`; pointer/click can also aim and fire. Do not block unrelated PRs for
  the missing `J` binding unless they edit input docs or controls.
- README documents standard ammo and power-ups but omits seeker ammo. Current
  code includes seeker projectiles/pickups. Treat this as pre-existing unless a
  PR changes ammo behavior or docs.
- README describes blast as a rare late-game power-up. Current code unlocks
  blast earlier than that wording implies. Raise it only for PRs touching
  power-up progression or documentation.

## Suggested local checks

Prefer these checks for code changes:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`npm run lint` currently maps to `next lint`, which is not reliable with this
Next version. If build/typecheck rewrites `next-env.d.ts` or creates
`tsconfig.tsbuildinfo`, ensure those generated artifacts are cleaned up unless
the PR intentionally changes generated typing behavior.

For asset changes, also verify that referenced files exist under `public/assets`
and that metadata frame sizes match the code consuming them.

## Managed Bugbot activation boundary

This file provides repository-specific review context for Cursor Bugbot. It does
not by itself enable the managed Bugbot service. End-to-end deployment still
requires:

- Cursor dashboard or organization settings enabling Bugbot for the repo.
- Cursor GitHub App access to `fjg-thr/hobgoblin-dungeon`.
- A pull request smoke check showing Bugbot review activity or status.

If those external checks are unavailable, state that repository guidance was
deployed but managed-service activation could not be proven from this branch.
