# Cursor Bugbot Review Instructions

## Project context

This repository is a dark, GBA-inspired isometric dungeon prototype. A Next.js App
Router shell mounts a Phaser 4 game client-side.

High-value review targets:

- `src/game/scenes/DungeonScene.ts`: primary gameplay scene and the highest-risk
  file. It contains run state, input, combat, enemy AI, HUD, audio, restart, and
  UI flows.
- `src/game/GameCanvas.tsx`: React-to-Phaser bridge. Keep Phaser and browser-only
  APIs out of server-rendered code paths.
- `src/game/maps/startingDungeon.ts`: procedural map generation, tile blocking,
  and tile asset selection.
- `src/game/assets/manifest.ts`: asset contract for preload keys, paths, frame
  sizes, and animation metadata.

## What to flag

Prioritize concrete correctness issues that could affect gameplay, stability, or
deployability:

1. Phaser lifecycle leaks: unremoved input/window listeners, orphaned timers,
   tweens, graphics, sprites, or groups after shutdown, death, restart, or scene
   rebuilds.
2. State-machine races around `gameStarted`, `gameOver`, `playerDying`, hit stop,
   invulnerability, ward, game start, game over, and restart. Watch for handlers
   that can shoot, spawn, damage, or mutate HUD state while the run should be
   paused or ended.
3. Collision and spawn regressions: tile blocking, map-edge movement, bridge and
   chasm rules, prop hitboxes, safe spawn distance checks, enemy respawn retries,
   and projectile hit tests.
4. Combat edge cases: ammo accounting, seeker targeting, blast radius, ward and
   invulnerability interactions, enemy death cleanup, score updates, power-up
   durations, and `MAX_SIMULATION_DT`/hit-stop time scaling.
5. Restart completeness: newly added projectiles, pickups, enemies, effects,
   tweens, containers, sounds, or timers must be cleared or reset when starting a
   new run.
6. Asset contract drift: changed manifest keys, paths, frame sizes,
   `framesPerRow`, or animation rows must still match Phaser preload and
   animation creation logic.
7. Browser and SSR safety: guard `window`, `document`, canvas, audio, and
   `localStorage` usage so Next.js builds and server rendering stay safe.
8. TypeScript correctness under strict mode. Avoid broad casts, nullable state
   access without narrowing, and implicit assumptions about Phaser object
   lifetime.

## What to leave alone

Do not spend review budget on low-signal generated or binary assets unless a
runtime contract file references them incorrectly:

- `public/assets/**/*.png`
- `public/assets/**/*.wav`
- `public/assets/**/*-original.json`
- `public/assets/audio/audio-manifest.json`
- `public/assets/**/**-sprite-sheet.json`
- `ASSET_PROMPTS.md`
- `package-lock.json`
- `pnpm-lock.yaml`
- `next-env.d.ts`

Generated asset changes are usually expected. Review `src/game/assets/manifest.ts`
when asset paths, keys, frame sizes, or metadata contracts change.

Treat `tools/**` and `scripts/**` as lower-priority than runtime code, but review
them when a PR changes asset generation behavior, package scripts, audio
generation, or the generated contracts consumed by the game.

## Review style

- Leave concise, inline comments only for actionable defects or high-confidence
  regressions.
- Explain the user-visible impact and the specific condition that triggers the
  issue.
- Prefer one clear fix direction over broad refactoring advice.
- If a change only has maintainability risk in the large `DungeonScene.ts`
  monolith, comment only when the risk can plausibly cause a bug.
- Do not request tests for every asset-only or visual-only change. Do request
  focused coverage or a manual smoke check when combat, lifecycle, restart,
  spawning, collision, or state gates change.

## Verification expectations

Primary automated gate:

```bash
npm run build
```

Do not require `npm run lint` as a review gate until the lint script is migrated
off legacy `next lint` for the installed Next.js version.

There is no committed unit, integration, lint, or end-to-end test suite. For
gameplay changes, ask for a manual smoke check covering start,
movement/collision, shooting/ammo, enemy spawn/pathing, power-ups, damage/death,
game over, restart, mute persistence, and window resize.
