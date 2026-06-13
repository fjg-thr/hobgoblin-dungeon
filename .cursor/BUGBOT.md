# Bugbot review guide for Hobgoblin Ruin

This repo is a Next.js App Router shell around a Phaser dungeon prototype. Use
this file as Bugbot's project-specific review context.

## Project map

- `src/app/page.tsx`: renders the game page.
- `src/game/GameCanvas.tsx`: client-only React boundary; dynamically imports
  Phaser and creates/destroys the `Phaser.Game`.
- `src/game/scenes/DungeonScene.ts`: Phaser scene, game loop, combat, pickups,
  HUD, audio, input, and cleanup.
- `src/game/maps/startingDungeon.ts`: regenerated dungeon layouts.
- `src/game/assets/manifest.ts`: source of truth for runtime asset paths, keys,
  frame sizes, audio keys, and manifest metadata.
- `public/assets/**`: runtime spritesheets, manifests, tiles, UI, effects, and
  WAV audio.
- `tools/**` and `scripts/**`: asset/audio generator and processor tooling.

## Review priorities

### Next.js, React, and Phaser lifecycle

- Keep Phaser and browser-only APIs behind client components, dynamic imports,
  `useEffect`, or other browser-only paths.
- `GameCanvas` should not create duplicate `Phaser.Game` instances, and must
  destroy the game on unmount.
- Added scene events, input handlers, timers, tweens, sounds, or global
  listeners need cleanup on shutdown/destroy when Phaser does not own them.
- Avoid unbounded per-frame allocations in movement, enemies, projectiles,
  collision, and HUD updates.
- Restarting a run should reset enemies, projectiles, pickups, timers,
  cooldowns, HUD state, audio state, and player status.
- Treat unsafe casts and non-null assertions in `DungeonScene.ts` cautiously;
  strict TypeScript should remain meaningful.

### Gameplay invariants

- Movement uses isometric `WASD`/arrow input. Current code shoots with `Space`
  and pointer/click; README also mentions `J`, an existing mismatch unless a PR
  intentionally changes controls.
- Ammo is finite. Standard pickups refill staff bolts; seeker ammo exists in
  code and unlocks during runs, though README text does not fully document it.
- Powerups include quickshot, haste, ward, and blast. README calls blast late
  and rare, while code may unlock it earlier; treat this as existing mismatch
  unless the PR changes progression.
- Combat changes should preserve health, ward blocking, hit feedback, scoring,
  projectile despawn, enemy cleanup, and game-over behavior.
- Collision/depth changes should keep isometric walls, props, actors,
  projectiles, pickups, HUD, and debug overlays drawing and colliding coherently.

### Assets, docs, and UI

- If `public/assets/**` changes, verify `src/game/assets/manifest.ts` and any
  JSON metadata still match paths, frame sizes, frame counts, and keys.
- If `tools/**` or `scripts/**` change, verify package scripts/docs still point
  to the right generator or processor and generated outputs are intentional.
- Do not flag pixel-art style preferences unless the diff breaks loading, alpha,
  sizing, metadata, animation indexing, or gameplay readability.
- Overlay DOM UI should remain keyboard accessible with readable contrast and
  clear focus/interaction states.
- README changes should match actual controls, unlock thresholds, asset lists,
  and available scripts.

## Suggested verification

- Prefer `npm ci`, `npm run build`, and `npx tsc --noEmit`.
- Do not rely on `npm run lint` alone; the script uses `next lint`, which may
  not exist in the installed Next.js version.
- Build/typecheck may generate `.next/`, `next-env.d.ts` rewrites, or
  `tsconfig.tsbuildinfo`; expect those to be untracked or restored unless the PR
  intentionally changes generated typing behavior.
- For gameplay PRs, ask for concise manual smoke notes covering affected parts
  of movement, shooting, pickups, enemy/player damage, restart/game-over, mute,
  and debug overlay behavior.

## Deployment boundary

This file provides repo-side review guidance only. Managed Bugbot activation
must still be verified outside the repo via Cursor dashboard/org settings,
Cursor GitHub App access, and a PR smoke check that produces a `Cursor Bugbot`
review or status.
