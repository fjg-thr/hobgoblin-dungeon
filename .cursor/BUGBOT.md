# Cursor Bugbot Review Rules

Use these rules when reviewing pull requests for this repository. Prioritize
actionable bugs, security issues, regressions, and correctness problems over
style-only feedback.

## Project context

- This is a Next.js app that hosts a Phaser-based dungeon game.
- The main gameplay logic lives in `src/game/scenes/DungeonScene.ts`.
- React and Next.js integration lives under `src/app` and `src/game/GameCanvas.tsx`.
- Runtime assets live under `public/assets`; many sprite sheets have matching
  JSON metadata files that must stay in sync with their images.
- Local asset generation and processing scripts live in `tools` and `scripts`.

## Always check for these issues

### Next.js and React

- Browser-only APIs, Phaser imports, and canvas setup must stay inside client
  components or browser-only code paths.
- Avoid changes that can cause hydration mismatches between server-rendered
  markup and client state.
- Interactive UI controls should remain reachable by keyboard and have clear
  accessible names.

### Phaser lifecycle and gameplay state

- Timers, tweens, input handlers, sounds, particles, and game objects created by
  a scene must be cleaned up or allowed to be destroyed with the scene.
- Restart, game-over, mute, and overlay flows must not leave stale listeners or
  duplicated objects behind.
- Health, ammo, score, cooldowns, spawn counters, and power-up timers should be
  clamped or reset where appropriate.
- Dead or destroyed actors should not continue to move, attack, collide, score,
  or receive delayed callbacks.
- Time-based behavior should use Phaser scene time consistently instead of
  mixing unrelated clocks in ways that can desynchronize gameplay.

### Assets and manifests

- New runtime assets should be referenced from the relevant manifest or preload
  path before use.
- Sprite sheet frame dimensions, frame counts, keys, and JSON metadata should
  match the corresponding image files.
- Asset paths should remain relative to `public/assets` conventions and should
  not depend on local machine paths.

### Performance-sensitive paths

- Avoid unbounded allocations, logging, object creation, or expensive searches
  in per-frame update loops.
- Watch for timers, particle emitters, enemy groups, projectiles, pickups, and
  audio loops that can grow without a cleanup path.
- Keep collision and targeting changes bounded for large enemy counts.

### Security and deployment

- Do not introduce secrets, tokens, private URLs, or machine-specific paths into
  source files, scripts, manifests, or documentation.
- Client-exposed environment variables and remote asset/script loads need a
  clear reason and should not leak privileged data.

## Review style

- Comment only when there is a concrete risk or a clear maintenance problem that
  can lead to bugs.
- Explain the user-visible impact and point to the smallest practical fix.
- Avoid requesting broad rewrites unless the current change creates a real
  correctness, security, lifecycle, or performance issue.
