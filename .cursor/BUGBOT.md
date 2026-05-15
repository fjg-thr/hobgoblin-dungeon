# Cursor Bugbot review guidance

Use this guide when reviewing changes in this repository. The managed Bugbot
service is enabled outside of git through Cursor product or organization
configuration; this file supplies the repo-specific review policy that Bugbot
should apply once it is run against pull requests or branches.

## Repository profile

- Product: Hobgoblin Ruin Prototype, a first-playable dark GBA-inspired
  isometric dungeon game.
- Stack: Next.js App Router, React, TypeScript, and Phaser 4.0.0-rc.4.
- Primary entry points:
  - `src/app/page.tsx` renders the game shell.
  - `src/app/layout.tsx` defines site metadata and OpenGraph/Twitter images.
  - `src/game/GameCanvas.tsx` is the client-only React boundary that boots
    Phaser.
  - `src/game/scenes/DungeonScene.ts` contains most game rendering, input,
    combat, UI, audio, debug, and progression logic.
  - `src/game/maps/startingDungeon.ts` owns map generation and tile semantics.
  - `src/game/assets/manifest.ts` is the source of truth for Phaser load keys
    and `public/assets/...` URLs.

## Review priorities

1. Flag correctness issues that would break the game, build, asset loading,
   input handling, React/Phaser lifecycle, or deployed metadata.
2. Prioritize browser/runtime failures over stylistic preferences. This is a
   prototype, so avoid treating README "Known Limitations" as regressions
   unless a change makes them worse.
3. Keep findings concrete and actionable. Include file and line references and
   explain the user-visible impact.
4. Do not ask for broad refactors unless they are necessary to prevent a real
   defect in the changed code.

## Next.js, React, and Phaser lifecycle checks

- `GameCanvas` is marked `"use client"` and dynamically imports Phaser and
  `DungeonScene`. Keep Phaser and scene code behind client-only imports so
  browser APIs such as `window`, `localStorage`, `document`, and canvas
  creation do not execute during server rendering.
- `next.config.ts` enables `reactStrictMode`. Review changes for Strict Mode
  double-mount safety: async Phaser boot should be cancellable, game instances
  should not be duplicated, and cleanup should destroy the Phaser game.
- Confirm resize, pixel-art, `roundPixels`, antialias, and parent container
  settings remain compatible with the full-window game shell.
- Be careful with event listeners, timers, tweens, keyboard/mouse handlers,
  audio objects, Phaser groups, and scene restarts. Added resources should be
  cleaned up or owned by Phaser systems that clean up with the scene.

## Game-scene and gameplay checks

- `DungeonScene.ts` is intentionally large and tightly coupled. Review changed
  behavior in context: movement, aiming, projectile lifetime, enemy spawning,
  damage, invulnerability/ward state, pickups, score, start/game-over screens,
  mute state, and debug overlay can interact.
- Check frame indexes and animation ranges when sprite sheets change. Many JSON
  metadata files under `public/assets` document source sheets, but scene code
  often uses explicit frame dimensions and generated frame ranges rather than
  reading those JSON files at runtime.
- Preserve the isometric coordinate contract from `startingDungeon.ts`,
  including `ISO_TILE_WIDTH`, `ISO_TILE_HEIGHT`, playable tile codes, blocking
  rules, prop blocking, enemy starts, and staircase placement.
- If map generation changes, look for edge cases where player starts, enemy
  starts, props, bridges, chasms, walls, or stairs can be placed out of bounds
  or on blocked tiles.

## Asset and public-file checks

- Asset paths in `assetManifest` must map to real files under `public/assets`.
  Any changed key, path, frame size, or sheet layout must be reflected in all
  Phaser load and animation code that consumes it.
- Keep README asset documentation and processing scripts aligned when generated
  asset outputs are added, renamed, or removed.
- `src/app/layout.tsx` references `/opengraph-image.png`; verify
  `public/opengraph-image.png` remains tracked when metadata is edited.
- Audio assets are WAV files in `public/assets/audio`. Review mute/default
  volume behavior and localStorage access for browser-only safety.

## Package and tooling checks

- This repo contains both `package-lock.json` and `pnpm-lock.yaml`. If
  dependencies change, ensure the lockfile story is intentional and
  reproducible.
- `package.json` uses `"latest"` for Next, React, React DOM, and TypeScript, so
  review build failures and generated types with possible version drift in
  mind.
- There is currently no committed unit test suite and no `test` script. Ask for
  focused tests only when the changed code creates a practical seam or high
  regression risk.
- `npm run lint` currently invokes `next lint`, but Next 16.2.4 no longer
  exposes an integrated `lint` subcommand. The CLI treats `lint` as a project
  directory and fails with `<project-root>/lint` missing. Prefer build and
  side-effect-free TypeScript verification until linting is migrated to a
  direct ESLint CLI/configuration or another explicit linter.

## Recommended verification

Run the strongest applicable subset for the changed files. The npm commands
match the checked-in `package-lock.json`; if the team switches to pnpm as the
authoritative installer, use the equivalent frozen-lockfile pnpm commands.

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
test -f public/opengraph-image.png
git ls-files --error-unmatch public/opengraph-image.png
git diff --check origin/main...HEAD
git diff --check
```

After build or TypeScript checks, confirm generated artifacts did not create
unintended working-tree changes. In this repo, `next-env.d.ts` can be touched by
Next, and `tsconfig.tsbuildinfo` can appear if TypeScript is run without
`--incremental false`.

## Review output format

- Lead with findings ordered by severity.
- Include exact file/line references.
- Explain why each finding matters and how to verify the fix.
- If no issues are found, say so and list any verification that was not run.
