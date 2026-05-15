# Cursor Bugbot Review Guide

Use this file as repository-specific context when reviewing changes to the
Hobgoblin Ruin prototype. The app is a Next.js App Router shell around a
client-side Phaser game, with most gameplay behavior centralized in
`src/game/scenes/DungeonScene.ts`.

## Review priorities

- Protect the React/Phaser boundary. `src/game/GameCanvas.tsx` should remain a
  client component that dynamically imports Phaser/game code, avoids server-side
  Phaser imports, and destroys the Phaser instance on unmount.
- Treat `src/game/assets/manifest.ts` as the source of truth for runtime asset
  keys and paths. New or renamed files under `public/assets/**` must keep
  manifest keys, Phaser loader calls, frame dimensions, and animation frame
  ranges in sync.
- Check tile and map changes across `src/game/maps/startingDungeon.ts`,
  `DungeonScene.ts`, and tile assets together. Tile codes, blocking rules,
  rendering choices, and collision assumptions are tightly coupled.
- Review sprite-sheet edits carefully. Phaser loader frame sizes and animation
  frame ranges must match each sheet's JSON/PNG layout, especially for actors,
  enemies, UI sheets, powerups, combat effects, and pickups.
- Preserve gameplay intent documented in `README.md`: simple collision, a
  regenerated dungeon per run, finite ammo, progression-gated enemies and
  powerups, a scene-level mute toggle, and a non-transitioning staircase unless a
  change explicitly targets that limitation.
- Watch for lifecycle leaks in Phaser scene changes. Resize handlers, keyboard
  handlers, timers, tweens, sounds, and event listeners should be cleaned up on
  scene shutdown or game destruction.
- Keep strict TypeScript boundaries. Prefer manifest-derived unions and explicit
  interfaces over widening gameplay keys, asset keys, and power-up types to
  plain `string`.
- Be cautious with performance-sensitive code in `DungeonScene.update()` and
  hot collision/projectile/enemy loops. Avoid per-frame allocations, repeated
  texture lookups, or DOM work in gameplay paths.
- Check accessibility when React UI changes are introduced. Keyboard operation,
  focus behavior, labels, and readable text should remain intact for menus and
  overlays.
- Confirm social metadata changes keep `src/app/layout.tsx` and
  `public/opengraph-image.png` aligned. The OpenGraph image is intentionally a
  tracked static asset.

## Asset and tooling expectations

- Generated assets should commit both processed runtime files and any source
  files the existing pipeline expects to keep.
- If a change touches asset processing, verify the relevant script in
  `package.json` still matches the tool file in `tools/` or `scripts/`.
- This repository currently has both `package-lock.json` and `pnpm-lock.yaml`.
  Flag dependency or lockfile drift that updates one package manager's lockfile
  while the change clearly depends on the other.
- Dependencies use `latest` ranges in `package.json`; reviewers should treat
  lockfile-only churn and missing lockfile updates as meaningful.
- The app depends on `phaser@4.0.0-rc.4`. Do not assume Phaser 3 examples or
  typings apply without checking the actual API used here.

## Verification commands

Prefer these checks from the repository root:

```bash
npm ci
npm run build
npx tsc --noEmit
test -f public/opengraph-image.png
git ls-files --error-unmatch public/opengraph-image.png
git diff --check
```

When reviewing asset pipeline changes, also run the specific package script that
matches the touched asset family, for example:

```bash
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
```

There is no committed test script. `npm run lint` is currently not a reliable
verification command in this repository because the Next.js CLI version in use
does not support the legacy `next lint` invocation from `package.json`; prefer
build and TypeScript checks until linting is migrated.

Build and typecheck commands may create local generated files such as
`tsconfig.tsbuildinfo` or touch `next-env.d.ts`. Do not include those artifacts
in a review unless the change intentionally updates TypeScript or Next.js
configuration.

## Review output expectations

- Lead with concrete bugs, regressions, missing verification, or production
  risks. Reference exact files and lines when possible.
- Distinguish intentional prototype limitations from regressions introduced by a
  change.
- For asset issues, name the broken asset key/path and the loader or animation
  code that depends on it.
- For gameplay issues, describe the player-visible failure mode, not just the
  internal invariant that was violated.
