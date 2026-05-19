# Cursor Bugbot review guidance

Review this repository as a first-playable Next.js App Router prototype for a dark
GBA-inspired isometric dungeon game. Prioritize user-visible regressions in the
browser game loop, asset loading, input handling, and deployment build.

## Project shape

- `src/app/page.tsx` renders the game shell and should stay thin.
- `src/game/GameCanvas.tsx` is the client-only React boundary. It dynamically
  imports Phaser and `DungeonScene`, creates exactly one game instance, and
  destroys it on unmount.
- `src/game/scenes/DungeonScene.ts` owns the Phaser scene, dungeon generation,
  input, combat, pickups, UI overlays, audio, and debug rendering.
- `src/game/maps/startingDungeon.ts` contains dungeon tile generation helpers.
- `src/game/assets/manifest.ts` is the source of truth for asset keys, frame
  dimensions, and browser-visible asset paths.
- Generated image/audio outputs live under `public/assets/`; generator and
  processor tooling lives under `tools/` and `scripts/`.

## High-value review areas

### Next.js and React boundaries

- Flag changes that import Phaser, touch `window`, or access browser-only APIs
  from Server Components or module scope outside `"use client"` files.
- Check that `GameCanvas` still guards duplicate boot, handles cancelled dynamic
  imports, and calls `game.destroy(true)` during React cleanup.
- Verify `metadataBase`, OpenGraph, and Twitter metadata stay valid for local and
  deployed URLs. If metadata references static files such as
  `/opengraph-image.png`, confirm the matching file exists in `public/`.

### Phaser scene lifecycle and input

- Confirm scene restarts, game-over flows, overlays, mute toggles, and how-to-play
  modals do not leak timers, tweens, event handlers, input zones, sprites, or
  audio instances.
- Review keyboard and pointer changes against documented controls. The current
  implementation binds staff-bolt firing to `SPACE` and click; README also
  mentions `J`, so flag changes that widen or preserve that mismatch without an
  intentional implementation or documentation fix.
- Ensure interactive zones preserve expected pointer cursor behavior and do not
  block gameplay input after modals close.

### Gameplay invariants

- Preserve the playable loop: move with WASD/arrows, aim with the pointer, fire
  finite-ammo projectiles, collect ammo/power-ups/hearts, survive enemy pressure,
  toggle sound, and restart after game over.
- Check health, damage, invulnerability/ward, hit-stop, camera shake, ammo counts,
  cooldowns, score updates, enemy removal, and pickup cleanup for off-by-one or
  stale-state errors.
- Treat seeker ammo as code-defined behavior: it unlocks after 4 kills or 30s,
  has separate ammo, pickups, targeting, and projectile damage, but is not yet
  documented in README.
- Treat blast timing as an existing README/code mismatch unless a change fixes
  it intentionally: README calls blast rare late-game, while `POWERUP_CONFIG`
  currently unlocks blast after 2 kills or 16 seconds.
- Brutes should remain progression-gated, capped, and spawned away from the
  player. Goblin pressure should ramp without spawning enemies on blocked tiles.

### Dungeon, depth, and collision

- Verify map-generation changes keep reachable floors, safe spawn positions,
  useful room/corridor connectivity, and no player/enemy/pickup spawns inside
  blocked terrain.
- Check isometric depth sorting for floor, props, walls, actors, projectiles,
  pickups, UI overlays, shadows, and debug graphics so sprites do not visually
  clip through walls or each other.
- Collision changes should preserve simple tile/proximity collision semantics and
  keep debug `F3` overlays aligned with actual blocked areas and actor bounds.

### Assets and generated data

- For any manifest entry, confirm the referenced browser path exists under
  `public/`, frame dimensions match the sprite sheet, metadata JSON frame counts
  line up with animation code, and asset keys remain unique.
- If generated sprite/audio outputs change, verify the corresponding generator or
  processing script and prompt/source notes are updated when relevant.
- Flag accidental commits of transient build artifacts such as `.next/`,
  `tsconfig.tsbuildinfo`, editor files, or generated route type churn unless the
  change intentionally updates tracked framework types.

### Verification expectations

- Prefer `npm ci` for dependency installation in review/CI contexts.
- Use `npm run build` as the main integration check.
- Use `npx tsc --noEmit --incremental false` for a side-effect-free TypeScript
  check.
- Do not rely on `npm run lint` until the project migrates away from the current
  `next lint` script; with the lockfile-resolved Next 16 CLI it is interpreted as
  a project directory named `lint`.
- For asset or manifest changes, additionally inspect changed `public/assets/**`
  JSON/PNG/WAV paths and any touched generator scripts.

## Review output

- Lead with concrete bugs, regressions, or missing verification.
- Include file and line references for each finding.
- Call out whether a finding blocks merge or is a follow-up improvement.
- Avoid broad style feedback unless it affects correctness, maintainability of
  touched code, accessibility, or the runtime game experience.
