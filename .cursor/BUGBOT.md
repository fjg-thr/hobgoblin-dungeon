# Cursor Bugbot Review Guide

Use this file as repository-specific context when Cursor Bugbot reviews pull
requests for Hobgoblin Ruin Prototype.

## Managed service boundary

- This file only gives hosted Bugbot review instructions. It does not enable the
  managed Bugbot service by itself.
- Confirm activation outside the repo through Cursor dashboard/org settings,
  GitHub App repository access for `fjg-thr/hobgoblin-dungeon`, and a live PR
  smoke review when available.
- These rules apply after this file is merged to the default branch. A PR that
  adds or changes this file may not be reviewed using its new guidance.
- Manual PR triggers can be top-level comments: `cursor review` or `bugbot run`.
  Use `cursor review verbose=true` or `bugbot run verbose=true` only for
  diagnostic request IDs and extra troubleshooting logs.

## Project shape

- Next.js app router entry points live in `src/app/`.
- `src/game/GameCanvas.tsx` hosts Phaser from React and must keep browser-only
  Phaser setup out of server-rendered paths.
- Main runtime logic is in `src/game/scenes/DungeonScene.ts`.
- Map data lives in `src/game/maps/startingDungeon.ts`.
- Runtime asset loading uses `src/game/assets/manifest.ts`; treat
  `public/assets/audio/audio-manifest.json` as auxiliary consistency data unless
  runtime code starts reading it.
- Generated and processed asset tooling lives in `tools/` and `scripts/`,
  including `tools/generate_audio_sfx.mjs` and
  `scripts/generate-retro-soundtrack.mjs`.

## Review priorities

- Flag gameplay regressions that break movement, collision, camera follow,
  enemy spawning, damage, ammo, score, powerups, restart, or audio mute.
- Check Phaser lifecycle changes for duplicate game instances, leaked timers,
  stale event handlers, unremoved keyboard/pointer listeners, and scene restart
  state that persists accidentally.
- Check React/Next changes for client/server boundaries, stable dynamic imports,
  metadata correctness, and hydration-safe DOM behavior.
- Review asset changes for manifest/path/frame consistency. A referenced asset
  must exist under `public/`, and JSON frame names or dimensions should match
  the Phaser code that consumes them.
- For DOM UI, prefer semantic elements and existing `src/app/globals.css`
  patterns. This repo does not currently configure Tailwind or shadcn/ui.
- For Phaser canvas UI, review pointer zones, keyboard and mouse affordances,
  readable responsive placement, and whether canvas-only controls have enough
  visible feedback.
- Keep dependency/tooling hardening separate from gameplay or guidance PRs
  unless the PR intentionally changes dependencies.

## Known baseline mismatches

- README says `Space` or `J` fires. Current runtime firing is `SPACE` plus
  pointer/click firing. Only block input/control-doc PRs that worsen or touch
  this mismatch.
- Current code includes seeker ammo progression that README does not document.
  Treat this as code-defined behavior unless a PR changes ammo docs or gameplay.
- README calls blast a rare late-game powerup, while current code unlocks blast
  after early kills or survival time. Do not block unrelated PRs solely for this
  existing mismatch.
- `src/app/layout.tsx` references `/opengraph-image.png`, but the baseline does
  not include that image. Only block PRs that touch share metadata/images or make
  the missing asset problem worse.
- `npm ci` currently reports baseline audit advisories from dependency versions.
  Note them, but do not block unrelated PRs without a dependency change.

## Verification to request or run

- Preferred scoped checks:
  - `npm ci`
  - `npm run build`
  - `npx tsc --noEmit`
- `npm run lint` is not a reliable gate here because the package script still
  uses `next lint`, which is unavailable in current Next.js versions.
- Next.js verification may rewrite `next-env.d.ts` between dev and production
  route type imports and may create `tsconfig.tsbuildinfo`. Unless a PR
  intentionally changes generated typing behavior, restore `next-env.d.ts` and
  do not commit `tsconfig.tsbuildinfo`.

## Review style

- Lead with concrete, reproducible bugs and user-visible regressions.
- Include file and line references when possible.
- Avoid blocking on known baseline issues unless the PR touches that area or
  increases risk.
- Keep suggestions scoped to this game prototype and its current architecture.
