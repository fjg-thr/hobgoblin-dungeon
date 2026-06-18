# Cursor Bugbot review guidance

Use this as repo-specific context when Cursor Bugbot reviews Hobgoblin Ruin
Prototype PRs. The managed service is enabled outside the repo through Cursor
org/repo settings and GitHub App access; this file only supplies review
instructions after it lands on the default branch. To smoke-test a PR, add a
top-level comment like `cursor review` or `bugbot run`; for troubleshooting use
`cursor review verbose=true` or `bugbot run verbose=true`.

## Project map

- `src/app/page.tsx` renders the client-only game shell.
- `src/game/GameCanvas.tsx` dynamically imports Phaser and `DungeonScene`, boots
  with `pixelArt`, `roundPixels`, and no antialiasing, and destroys the game on
  unmount.
- `src/game/scenes/DungeonScene.ts` owns most gameplay: start/game-over UI,
  player input, aiming, projectiles, seeker ammo, enemy spawning/pathing,
  pickups, power-ups, HUD, audio, hit-stop, and the `F3` debug overlay.
- `src/game/maps/startingDungeon.ts` owns procedural rooms/corridors, tile
  codes, map dimensions, isometric constants, and blocking checks.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded image,
  spritesheet, UI, projectile, pickup, power-up, and audio assets.
- `ASSET_PROMPTS.md`, `tools/`, `scripts/`, and `public/assets/**` are the asset
  pipeline for Phaser-ready files and metadata.

## Review priorities

1. Protect Phaser lifecycle and client boundaries. Server-rendered files must
   not directly import Phaser or browser-only game code; keep dynamic imports in
   the client shell and preserve cleanup on unmount.
2. Scrutinize `DungeonScene.ts` changes. Look for regressions in tile/world
   conversion, collision, depth ordering, enemy pathing, projectile cleanup,
   seeker targeting, pickups, power-up timers, ward, blast, audio mute state,
   and start/game-over transitions.
3. Keep map contracts synchronized. New tile codes, obstacles, or spawn rules
   should update generation, blocking, safe-spawn logic, rendering, and debug
   visualization together.
4. Keep asset contracts synchronized. `assetManifest` keys, paths, frame sizes,
   rows, metadata JSON, generated public files, and generator scripts must stay
   in agreement. Preserve nearest-neighbor/pixel-art assumptions.
5. Prefer the existing app style. This repo does not currently configure
   Tailwind or shadcn/ui; UI review should favor semantic markup, accessibility,
   and the existing `src/app/globals.css` patterns.
6. Treat dependency edits as high signal. The repo has both `package-lock.json`
   and `pnpm-lock.yaml`; verify the package manager and avoid unrelated churn.

## Known baseline mismatches and limitations

Do not block unrelated PRs solely for these existing conditions, but flag PRs
that touch the affected area and make a mismatch worse.

- README controls say `Space` or `J` fires; current runtime binds shooting to
  `Space` plus pointer/click firing.
- README describes blast as a rare late-game power-up; current runtime unlocks
  blast after 2 kills or 16 seconds.
- README omits seeker ammo. Runtime unlocks it after 4 kills or 30 seconds and
  consumes seeker shots before standard ammo.
- `src/app/layout.tsx` references `/opengraph-image.png`; no matching
  `opengraph-image.*` asset exists in the current repo.
- The staircase is intentionally visible but does not transition levels yet.
- Collision is simple tile/proximity logic, not a full physics system.
- Each run intentionally generates a fresh room-and-corridor dungeon.
- Sound/music are first-pass procedural WAV assets with scene-level mute state.

## Suggested verification

For most code or asset PRs:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`npm run lint` maps to `next lint`, which is not reliable with current Next
tooling, so do not treat it as the sole quality gate. After build/typecheck,
avoid committing rewritten `next-env.d.ts` or `tsconfig.tsbuildinfo` unless the
PR intentionally changes Next type generation behavior.

Manual smoke coverage is important because this repo has no test framework yet:

- Start the game, open/close the how-to-play modal, and begin a run.
- Move with WASD or arrow keys, aim with the mouse, fire with `Space`, and click
  to aim/fire once.
- Verify ammo depletion, regular ammo pickups, seeker pickups after unlock,
  quickshot, haste, ward, blast, heart pickups, enemy contact damage, mute
  toggle, game over, restart, and `F3` debug overlay.
- For asset PRs, confirm frame sizes, transparency, nearest-neighbor scaling,
  animation rows, audio paths, and manifest keys.

## Review output expectations

Lead with actionable findings ordered by severity. Include file/line references,
impact, and the smallest safe fix. Separate baseline issues from PR regressions.
If no issues are found, say so and call out verification that could not be
performed, especially managed Bugbot checks requiring Cursor or GitHub admin
access.
