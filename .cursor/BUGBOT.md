# Cursor Bugbot Review Guide

Use this guidance when reviewing changes in this repository. The project is a
Next.js App Router prototype that mounts a Phaser dungeon game from a client
component.

## Project shape

- `src/app/page.tsx` renders the game canvas.
- `src/app/layout.tsx` owns page metadata and references
  `public/opengraph-image.png` for social previews.
- `src/game/GameCanvas.tsx` is the React-to-Phaser bridge. It must remain a
  client component and boot Phaser from `useEffect`.
- `src/game/scenes/DungeonScene.ts` contains the main Phaser scene, including
  preloading, combat, enemies, pickups, HUD, audio, menus, and update loops.
- `src/game/maps/startingDungeon.ts` contains map generation, tile codes, and
  blocking helpers used by the scene.
- `src/game/assets/manifest.ts` is the contract between code and files in
  `public/assets/**`.
- `tools/**` and `scripts/**` generate or process assets; review generated
  outputs together with source/tool changes.

## High-priority review areas

1. Keep Phaser, `window`, canvas, audio, pointer, and keyboard access out of
   server components. Browser-only behavior belongs in client components,
   Phaser scenes, or effects.
2. Preserve the `GameCanvas` lifecycle guard: async Phaser imports can race
   React Strict Mode remounts, so cleanup must cancel pending boot work and call
   `game.destroy(true)`.
3. Treat `DungeonScene.ts` changes as high risk. Check state transitions,
   timers, object cleanup, collision assumptions, spawn/despawn paths, restart
   behavior, and per-frame allocations in `update`.
4. Validate manifest and asset changes as a set. Every manifest path should
   exist under `public/`, sprite-sheet frame sizes should match the JSON/image
   layout, and Phaser loader keys should stay unique.
5. For map-generation changes, check grid bounds, coordinate conversions,
   blocking semantics, and coupling with enemy/player spawn assumptions.
6. For UI/menu changes inside Phaser, check keyboard and pointer accessibility
   where practical, readable contrast, and that interactive zones are destroyed
   or hidden when screens change.
7. For audio changes, preserve the scene-level mute toggle and avoid starting
   overlapping loops after restart or remount.
8. For dependency changes, pay attention to reproducibility. The repo currently
   has both `package-lock.json` and `pnpm-lock.yaml`; prefer the npm workflow
   used by the README/package lock unless the change intentionally migrates the
   package manager and updates all related files.

## Expected checks

For most code changes, request or run:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

`npm run build` can rewrite tracked Next.js generated type references in
`next-env.d.ts`. Treat that as local tool output unless the change intentionally
updates Next/TypeScript configuration, and restore the file before finalizing a
review. If someone runs plain `npx tsc --noEmit`, TypeScript can also create an
untracked `tsconfig.tsbuildinfo` because `incremental` is enabled; delete it or
use `--incremental false` as shown above.

`npm run lint` is currently wired to `next lint`, which is not reliable with
the current Next CLI in this repository. If it fails with an invalid project
directory for `/workspace/lint`, report the tooling limitation instead of
blocking unrelated changes. Prefer `npm run build` and the side-effect-free
type-check command above until the lint script is migrated.

When metadata or share-image behavior changes, also verify:

```bash
test -f public/opengraph-image.png
git ls-files --error-unmatch public/opengraph-image.png
```

The repo does not currently define a test script. Do not claim tests pass unless
a change adds and runs a test command.

## Known limitations that are not review findings by themselves

- Collision is intentionally simple and not a full physics simulation.
- The staircase is visible but does not transition to another level.
- Character and effect assets are first-pass generated pixel art.
- The current game loop is intentionally a compact first-playable prototype.

Only flag these limitations when a diff claims to solve them, makes them worse,
or creates a regression in nearby behavior.

## Review output expectations

- Prioritize concrete bugs and regressions over broad refactor advice.
- Include file and line references for findings.
- Call out missing verification only when the skipped check is relevant to the
  changed files.
- Avoid suggesting new abstractions unless they reduce clear duplication or
  isolate a risky cross-cutting concern already touched by the diff.
