# Cursor Bugbot Review Guidance

Use this file as repository-specific context when reviewing pull requests for the
Hobgoblin Ruin Prototype. Bugbot managed-service enablement still happens
outside this repository through Cursor dashboard settings and GitHub App access;
this file provides the review rules the service should apply once enabled.

## Project snapshot

- Next.js App Router app with React server components by default.
- `src/game/GameCanvas.tsx` is the client-only bridge that dynamically imports
  Phaser and creates/destroys the game instance.
- `src/game/scenes/DungeonScene.ts` contains most runtime behavior: dungeon
  rendering, input, camera, combat, enemy AI, pickups, HUD, audio, and debug UI.
- `src/game/maps/startingDungeon.ts` owns tile codes, map generation, and
  blocked/playable tile rules.
- `src/game/assets/manifest.ts` maps Phaser asset keys to files under
  `public/assets`.
- `tools/` and `scripts/` contain asset and audio generator/processor tooling.

## High-priority review focus

### Next.js, React, and Phaser boundaries

- Keep Phaser imports and browser-only APIs behind client-only code. Server
  components, metadata, and build-time modules must not touch `window`,
  `document`, Phaser runtime objects, or browser storage directly.
- `GameCanvas` should remain resilient to React remounts: one Phaser game per
  host element, cancelled async boot handled, and `game.destroy(true)` called on
  cleanup.
- Avoid adding React state that mirrors fast Phaser scene state unless the PR
  clearly defines synchronization and teardown behavior.

### Scene lifecycle and game loop safety

- Check new input, scale, scene, timer, tween, sound, and animation listeners for
  cleanup on scene shutdown or object destruction.
- Watch for leaks in pooled/transient objects such as projectiles, powerups,
  combat effects, damage numbers, afterimages, death sprites, and HUD elements.
- Guard fixed-step or delta-time changes against large frame spikes. The current
  scene caps simulation delta with `MAX_SIMULATION_DT`.

### Gameplay invariants

- Keep tile-space and screen-space math explicit. Collision radii, projectile
  speeds, pickup ranges, enemy pathing, and camera offsets are mostly tile-based
  until converted through `tileToWorld`.
- Preserve dungeon map invariants: every row must match the map width, playable
  tile codes must stay in sync with collision/asset mapping, and generated spawn
  points should remain reachable and away from unsafe areas.
- Review enemy, ammo, seeker ammo, heart, and power-up tuning as a connected
  system. Seeker ammo currently unlocks after 4 kills or 30 seconds and is
  implemented in code even though README copy does not describe it.
- Blast is currently configured in code to unlock after 2 kills or 16 seconds;
  README text still describes blast as rare late-game. Treat that as an existing
  docs/code mismatch unless the PR intentionally changes power-up progression.

### Controls, HUD, and accessibility

- Runtime smoke checks should cover WASD/arrow movement, pointer aiming, Space
  firing, click-to-fire, sound mute, game over/start over, and F3 debug overlay.
- The code currently binds firing to Space and pointer/click. README also
  mentions `J`; do not block unrelated PRs solely on that pre-existing mismatch.
- For DOM UI outside Phaser, prefer semantic HTML and existing
  `src/app/globals.css` patterns. This repo does not currently use Tailwind or
  shadcn/ui.

### Assets and tooling

- Asset changes should keep generated PNG/WAV files, JSON metadata, and
  `assetManifest` entries synchronized.
- If generator or processor scripts change, review both `tools/` and `scripts/`
  paths and require deterministic output paths with no accidental source-image
  or temporary-file churn.
- Keep Phaser sprite dimensions, frame rows, animation ranges, and metadata
  files consistent. A wrong frame size can pass TypeScript but break runtime
  animation.
- Avoid introducing remote asset dependencies for runtime gameplay; existing
  gameplay assets are served from `public/assets`.

## Verification expectations

For normal code changes, ask for:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`npm run lint` maps to `next lint`, which is not reliable in current Next
versions for this repo. Use it only if the branch also fixes or replaces that
script.

For asset/tooling changes, also ask for the relevant generator or processor
script plus a manifest/file-list sanity check. For gameplay changes, request a
manual browser smoke check with `npm run dev` because there is no automated game
test suite yet.

Build/typecheck may rewrite `next-env.d.ts` route-type imports or create
`tsconfig.tsbuildinfo`; do not include those generated changes unless the PR is
specifically about Next type generation.

## Managed Bugbot deployment checks

Repository files cannot prove that the managed Bugbot service is enabled. When
reviewing deployment PRs, verify or ask the maintainer to verify:

1. Cursor dashboard/org settings enable Bugbot for this repository.
2. The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
3. A pull request smoke test triggers an automatic Bugbot review, or a maintainer
   can trigger one with the supported PR command such as `cursor review`.
