# Cursor Bugbot Review Guide

Use this repository-specific guidance when reviewing pull requests for the
Hobgoblin Ruin Prototype. Focus on defects that would break the playable
Next.js + Phaser game, asset pipeline, or deployability. Prefer actionable
findings with file and line references over broad style advice.

## Project shape

- Next.js App Router renders a single page at `src/app/page.tsx`.
- The Phaser game is intentionally isolated behind the client-only component
  `src/game/GameCanvas.tsx`.
- Most game behavior lives in `src/game/scenes/DungeonScene.ts`.
- Asset paths and frame dimensions are centralized in
  `src/game/assets/manifest.ts`.
- Procedural map generation and tile semantics live in
  `src/game/maps/startingDungeon.ts`.
- Source and generated art/audio assets are under `public/assets`, with
  generator and processor scripts under both `tools/` and `scripts/`.

## High-priority review checks

### Next.js and Phaser boundary

- `GameCanvas` must stay a client component. Do not allow Phaser imports or
  browser-only globals to move into server components or module paths executed
  during SSR.
- Keep the dynamic `import("phaser")` and scene import inside the effect, and
  preserve the cancellation guard so a late import cannot create a game after
  unmount.
- Cleanup must destroy the Phaser game and clear `gameRef`. Changes that add
  event listeners, timers, audio, or external subscriptions need matching
  teardown.
- Preserve fullscreen sizing and resize behavior. Regressions here commonly
  show up as a blank canvas, clipped world, or duplicate canvases after
  navigation/HMR.

### Scene lifecycle, input, and audio

- `DungeonScene` owns large amounts of mutable Phaser state. Check that newly
  added sprites, tweens, timers, keyboard/pointer handlers, sounds, and arrays
  are destroyed or removed during scene shutdown/restart/game over paths.
- Validate input changes against current behavior: movement is `WASD` or arrow
  keys, firing is `Space` and click in code. The README also mentions `J`, but
  `J` is not currently bound; flag PRs that widen or rely on that mismatch
  unless they intentionally implement or document the behavior.
- Audio changes should respect the scene-level mute toggle and avoid starting
  overlapping ambience/music loops on restart.
- For UI/HUD changes, verify depths and camera scroll factors. HUD elements
  should remain screen-fixed and not sort behind world sprites.

### Gameplay invariants

- Maintain finite standard ammo and seeker ammo behavior. Seeker ammo is
  code-defined but not currently documented in the README; do not treat the
  absence of README text as new unless the PR touches ammo docs or seeker
  behavior.
- Powerups are `quickshot`, `haste`, `ward`, and `blast`. The README describes
  blast as rare late-game, but the current code unlocks it after early
  progression (`POWERUP_CONFIG.blast`); flag changes that make the docs/code
  mismatch worse or silently change balance.
- Enemy, projectile, pickup, and powerup changes should preserve object pool
  limits and removal from tracking arrays to avoid accumulating invisible
  GameObjects over a long run.
- Collision and damage changes need to account for tile-space coordinates,
  isometric projection, prop collision boxes, enemy hitboxes, projectile radii,
  and knockback. Watch for mixing screen pixels with tile units.
- When map generation changes, ensure `playerStart`, `enemyStarts`, stairs,
  bridges, chasms, walls, blocking props, and playable floor tiles remain
  internally consistent and reachable.

### Assets and metadata

- Every path added to `assetManifest` or README asset lists should exist under
  `public/` with the exact case-sensitive name used by the code.
- Sprite sheet metadata and code must agree on frame width, frame height, frames
  per row, frame counts, and animation row ordering.
- Generated outputs should stay deterministic enough for review. Large binary
  asset changes should include matching metadata and, when relevant,
  generator/processor updates.
- The metadata in `src/app/layout.tsx` references `/opengraph-image.png`;
  currently `public/opengraph-image.png` is absent. Flag PRs that add or change
  metadata/share-image references without keeping the public asset in sync.

## Verification commands

Ask for or run these checks when reviewing meaningful code, asset manifest,
dependency, or build changes:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
git diff --check origin/main...HEAD
git diff --check
```

Do not recommend `npm run lint` as a required check until the script is migrated
away from `next lint`; with the current Next.js version it is interpreted as a
project directory and fails with `Invalid project directory provided`.

After `npm run build`, check for generated-file churn such as `next-env.d.ts`.
Do not require committing that churn unless the PR intentionally changes Next.js
or TypeScript configuration.

## Review output expectations

- Lead with correctness, runtime, build, asset, and regression risks.
- Distinguish new issues introduced by the PR from known existing mismatches
  noted above.
- Avoid comments about preference-only formatting unless it hides a real bug.
- If a finding depends on manual gameplay validation, name the exact smoke path
  to reproduce it, such as starting a run, firing with `Space`, clicking to
  shoot, collecting ammo/powerups, toggling sound, taking damage, dying,
  restarting, and toggling `F3` debug overlays.
