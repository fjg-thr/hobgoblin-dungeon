# Cursor Bugbot review guide

Use this repository guidance when Cursor Bugbot reviews pull requests for the
Hobgoblin Ruin Prototype. This file provides repo-specific review context; it
does not enable the managed Bugbot service by itself. Managed activation still
depends on Cursor dashboard or organization settings, GitHub App repository
access, and a smoke review on a pull request after this file is on the default
branch.

## How to trigger or verify Bugbot

- On a pull request, use a top-level comment with `cursor review` or
  `bugbot run`.
- For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true` to request extra log/request details.
- If no review appears, verify Cursor org settings, GitHub App access for
  `fjg-thr/hobgoblin-dungeon`, and Bugbot/Admin API configuration outside this
  repository.

## Project shape

- Next.js app router shell in `src/app`.
- Client-only Phaser bootstrapping in `src/game/GameCanvas.tsx`.
- Main gameplay scene in `src/game/scenes/DungeonScene.ts`.
- Map generation and tile codes in `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth in `src/game/assets/manifest.ts`.
- Generated/processed asset tooling lives in `tools/` and `scripts/`.

## Review priorities

1. Preserve SSR/client boundaries. Phaser must stay behind `"use client"` and
   dynamic imports in `GameCanvas`; server components must not touch
   `window`, `document`, or Phaser globals.
2. Check Phaser lifecycle cleanup. Game, scene, input, timers, sounds, and
   event handlers added by PRs should be destroyed or unregistered when scenes
   stop or React unmounts.
3. Protect asset contracts. Any sprite/audio path, frame size, atlas metadata,
   or tile code change must match `assetManifest`, files under `public/assets`,
   and loader usage in `DungeonScene`.
4. Treat `assetManifest.audio` as the runtime audio source of truth. The JSON
   audio manifest is auxiliary unless a PR explicitly wires it into runtime.
5. Validate gameplay invariants: finite ammo, seeker ammo/projectiles, heart
   pickup limits, ward damage blocking, blast damage, enemy respawn/pathing,
   score updates, and debug overlay behavior.
6. Review input and canvas UX carefully. Current runtime firing is Space and
   pointer/click; README also mentions J, which is an existing docs/code
   mismatch unless an input/control PR changes it.
7. Keep power-up docs drift in mind. Seeker ammo exists in code but is not fully
   documented in README. Blast timing also has existing README/code drift.
   Block PRs that worsen or touch those areas without reconciling them.
8. For metadata/share-image changes, note that `src/app/layout.tsx` references
   `/opengraph-image.png`; require the referenced public file or an app metadata
   image route if a PR changes that behavior.
9. Prefer existing CSS in `src/app/globals.css` for DOM UI. This project does
   not currently configure Tailwind or shadcn/ui.
10. Keep dependency/tooling changes separate from gameplay/config PRs unless the
    PR is explicitly about dependency maintenance.

## Verification commands

Ask contributors to run the commands that match their changes:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Use targeted asset commands when relevant:

```bash
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
```

`next lint` is not reliable with the current Next.js version in this repo, so
prefer build and TypeScript checks. `npm ci` may report existing audit findings;
do not block unrelated PRs solely on that baseline unless they change
dependencies or make the advisory set worse.

## Review style

- Lead with concrete correctness, regression, security, and missing-test risks.
- Cite specific files and lines.
- Avoid blocking on known baseline issues unless the PR touches that area.
- For generated assets, verify the source prompt/tooling path and final public
  files stay consistent rather than reviewing binary image details in isolation.
