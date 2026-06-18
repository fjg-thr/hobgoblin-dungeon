# Cursor Bugbot review guide

This file gives repository-specific context to Cursor Bugbot. It does not
enable the managed Bugbot service by itself; enablement, trigger mode, and
repository access are controlled from the Cursor dashboard and the GitHub App
installation. These rules apply after this file is merged to the default
branch.

## Operation notes

- Confirm the Cursor dashboard has Bugbot enabled for this repository and that
  the GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
- If automatic review is disabled, trigger a PR review with a top-level comment:
  `cursor review` or `bugbot run`.
- For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true` and check the emitted request details.
- A PR that adds or changes this file may not be reviewed with the updated
  guidance until the change reaches the default branch.

## Project map

- `src/app/page.tsx` renders the client-only game canvas shell.
- `src/game/GameCanvas.tsx` dynamically imports Phaser and `DungeonScene`, owns
  mount/unmount cleanup, and must avoid server-side Phaser access.
- `src/game/scenes/DungeonScene.ts` contains most gameplay, input, HUD,
  sound, spawning, collisions, pickups, and Phaser canvas UI overlays.
- `src/game/maps/startingDungeon.ts` generates the dungeon layout.
- `src/game/assets/manifest.ts` is the runtime asset source of truth,
  including audio loaded by `DungeonScene`.
- `public/assets/**` contains generated sprite/audio assets and metadata.
- `tools/**` and `scripts/**` contain asset/audio generators and processors.
- `src/app/layout.tsx` owns app metadata and OpenGraph references.

## Review priorities

1. Flag runtime crashes and hydration issues, especially anything that imports
   or touches Phaser during server rendering.
2. Check Phaser lifecycle cleanup. Scene, event, keyboard, timer, audio, and DOM
   listeners should be removed when the React component or scene is destroyed.
3. Treat `DungeonScene.ts` as gameplay-critical. Review changes for state
   invariants around health, ammo, power-up timers, scoring, enemy spawning,
   projectile ownership, and restart/game-over transitions.
4. Review asset changes against the runtime manifest. If a sprite, JSON frame,
   or audio file path changes, confirm the manifest and scene preload/use sites
   stay consistent.
5. For DOM/metadata/future HTML UI changes, check semantic markup,
   accessibility, responsive behavior, and existing `src/app/globals.css`
   conventions. This repo does not currently configure Tailwind or Shadcn.
6. For Phaser canvas UI overlays and interactivity, check pointer zones,
   keyboard/mouse affordances, responsive placement, readable contrast, and
   canvas-specific accessibility limitations.
7. Dependency changes should be reviewed conservatively. Prefer no new runtime
   dependency unless it clearly replaces substantial complexity.

## Known baseline context

Do not block unrelated PRs solely for these pre-existing mismatches, but flag
them when a PR touches the relevant area:

- README says `Space` or `J` fires; current runtime firing is bound to `Space`
  and pointer/click.
- README omits seeker ammo, while current gameplay unlocks seeker ammo after a
  kill/time threshold.
- README describes blast as rare late-game, while current code unlocks blast
  earlier through `POWERUP_CONFIG.blast`.
- `src/app/layout.tsx` references `/opengraph-image.png`; verify metadata asset
  inventory if OpenGraph or public image files change.
- `next lint` is not reliable with the current Next setup. Prefer build and
  TypeScript verification.
- Next verification may rewrite `next-env.d.ts` and create
  `tsconfig.tsbuildinfo`; those generated artifacts should not be committed
  unless the PR intentionally changes Next typing behavior.

## Suggested verification by change type

- General app/runtime changes: `npm run build` and `npx tsc --noEmit`.
- Dependency or lockfile changes: `npm ci`, then `npm run build` and
  `npx tsc --noEmit`.
- Asset manifest or generated metadata changes: run the relevant generator or
  processor script when practical, then build/typecheck.
- Markdown-only Bugbot guidance changes: `git diff --check` is sufficient, with
  build/typecheck optional when the surrounding branch is otherwise unchanged.

## Review output expectations

- Lead with actionable bugs, regressions, security concerns, or missing tests.
- Reference concrete files and lines from the PR diff.
- Separate shipped behavior risks from known baseline limitations listed above.
- Avoid broad style-only comments unless they would prevent real defects in this
  small game prototype.
