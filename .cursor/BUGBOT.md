# Cursor Bugbot Review Guidance

This repository is a Next.js, React, TypeScript, and Phaser prototype for
Hobgoblin Ruin. Use this file as repository-specific context when Cursor
Bugbot reviews pull requests.

## Deployment boundary

- This file supplies review instructions only. It does not install or enable
  the managed Cursor Bugbot service.
- Confirm managed enablement outside the repo: Cursor dashboard or org settings,
  GitHub App repository access, and a live PR smoke review after this file lands
  on the default branch.
- Manual review triggers supported by Cursor public docs include top-level PR
  comments: `cursor review` or `bugbot run`. For troubleshooting, use
  `cursor review verbose=true` or `bugbot run verbose=true`.
- Rules in this file apply after `.cursor/BUGBOT.md` is merged to the default
  branch. A PR that adds or edits this file may not be reviewed with the new
  guidance yet.

## Project map

- `src/app/page.tsx` renders the single game page and mounts `GameCanvas`.
- `src/game/GameCanvas.tsx` is a client component that dynamically imports
  Phaser and `DungeonScene` inside `useEffect`. Avoid server-side Phaser imports.
- `src/game/scenes/DungeonScene.ts` owns runtime gameplay: scene boot, input,
  map rendering, enemies, projectiles, pickups, audio, HUD, start/how-to-play
  UI, and debug drawing.
- `src/game/assets/manifest.ts` is the runtime source of truth for Phaser asset
  paths, sprite metadata, power-up sprite rows, and audio keys.
- `src/game/maps/startingDungeon.ts` generates the room-and-corridor dungeon.
- `src/app/layout.tsx` owns metadata, OpenGraph, Twitter card data, and global
  document structure.
- `src/app/globals.css` owns styling. This repo does not configure Tailwind;
  prefer semantic markup and existing CSS conventions over Tailwind utilities.
- `tools/` and `scripts/` contain asset/audio generator and processor tooling.
  Do not treat generated assets as hand-authored gameplay logic.

## Review priorities

1. Runtime correctness for game boot and browser-only Phaser code. Flag PRs that
   import Phaser or scene code from server components, metadata files, or other
   paths that execute during SSR.
2. Gameplay regressions in `DungeonScene`: input, projectile cooldowns, ammo,
   seeker ammo, power-up unlocks, enemy spawn/attack timing, damage handling,
   score, game-over/restart, audio mute, and debug overlay behavior.
3. Asset manifest consistency. When a PR adds, removes, renames, or relocates
   runtime assets, check `assetManifest`, corresponding files under `public/`,
   and metadata JSON together.
4. Accessibility and UX in React-rendered surfaces and Phaser UI overlays. Ensure
   any DOM buttons or controls have appropriate semantic roles, keyboard support,
   labels, and focus behavior.
5. Metadata and share-card changes. If a PR touches `src/app/layout.tsx`,
   OpenGraph/Twitter metadata, or public image assets, verify referenced image
   files actually exist and dimensions/alt text remain accurate.
6. Dependency/tooling changes. Be strict about lockfile consistency and avoid
   accepting dependency churn unrelated to the PR goal.

## Existing baseline context

Treat these as known baseline mismatches unless the PR intentionally touches the
related feature or documentation:

- README says `Space` or `J` fires. Current runtime binds firing to `Space` and
  pointer/click only.
- README describes blast as rare late-game. Current runtime unlocks blast after
  2 kills or 16 seconds via `POWERUP_CONFIG.blast`.
- README documents quickshot, haste, ward, blast, regular ammo, and hearts, but
  does not document seeker ammo. Current code unlocks seeker ammo after 4 kills
  or 30 seconds and uses seeker pickups/projectiles.
- `src/app/layout.tsx` references `/opengraph-image.png`; the file may be absent
  on branches that only changed metadata. Flag this when metadata or public
  share assets are in scope.
- `public/assets/audio/audio-manifest.json` is auxiliary. Runtime audio loading
  uses `assetManifest.audio`.

## Verification guidance

For review comments, ask authors to run only the checks relevant to the change:

- `npm ci`
- `npm run build`
- `npx tsc --noEmit`
- `git diff --check <base>..HEAD`

Notes:

- `npm run lint` currently maps to `next lint`, which is not reliable with
  current Next versions. Prefer build plus TypeScript until lint tooling is
  intentionally updated.
- Build/typecheck can rewrite `next-env.d.ts` between dev and production route
  type locations and can create `tsconfig.tsbuildinfo`; do not request those
  artifacts be committed unless the PR intentionally changes type-generation
  behavior.
- This package intentionally has no `npm start` script. Do not require one for
  unrelated PRs.
- If CI compares diffs, compare against the actual PR base ref rather than a
  hard-coded `origin/main`.

## Review output expectations

- Lead with concrete bugs, regressions, security issues, or missing verification.
- Cite exact files and lines whenever possible.
- Distinguish blockers from existing baseline context.
- Avoid broad style-only comments unless they affect maintainability,
  accessibility, correctness, or repository conventions.
- Do not claim the managed Bugbot service is enabled based only on this file.
