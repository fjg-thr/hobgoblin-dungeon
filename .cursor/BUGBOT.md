# Cursor Bugbot Review Guide

Use this guide when reviewing pull requests for Hobgoblin Ruin. The repository
side of Bugbot deployment is this file; the managed Cursor Bugbot service still
must be enabled through the Cursor dashboard and the Cursor GitHub App must have
access to this repository.

## Operating notes

- Manual review triggers supported by Cursor are top-level PR comments:
  `cursor review`, `bugbot run`, `cursor review verbose=true`, or
  `bugbot run verbose=true`.
- This file is most reliable after it is merged to the default branch. A PR that
  adds or edits this guide may be reviewed with the previously available rules.
- Do not invent CI results. If GitHub checks are absent or a command was not run,
  state that clearly and review from the diff plus available project context.
- Treat this as a Next.js App Router, React, TypeScript, and Phaser 4 RC project.
  There is no Tailwind or shadcn/ui setup in this repository.

## Project map

- `src/app/page.tsx` renders the game shell and should stay small.
- `src/game/GameCanvas.tsx` is the client-only React bridge. It dynamically
  imports Phaser and `DungeonScene`, creates one game instance, and destroys it
  on unmount. Watch for SSR, hydration, resize, and cleanup regressions here.
- `src/game/scenes/DungeonScene.ts` owns most runtime gameplay: player movement,
  aiming, projectiles, enemies, pickups, power-ups, HUD, audio, and scene state.
- `src/game/maps/startingDungeon.ts` owns dungeon generation, tile codes,
  blocking checks, and tile-to-asset mapping.
- `src/game/assets/manifest.ts` is the runtime source of truth for assets and
  audio loaded by Phaser. Keep asset keys, frame sizes, metadata paths, and files
  under `public/assets/` aligned.
- Asset generation and processing tooling lives under both `tools/` and
  `scripts/`. Generated binary assets can be large; focus review on whether the
  source manifest, processor inputs, and committed outputs agree.

## Review priorities

1. Flag user-visible gameplay regressions: broken boot, black screens, missing
   assets, crashes during a run, stuck controls, impossible pickups, enemy spawn
   failures, or game-over/start-screen loops that cannot recover.
2. Flag React/Next issues that would break production builds: missing `"use
   client"` boundaries for browser-only APIs, server-side imports of Phaser,
   metadata mistakes, unhandled environment assumptions, or changed generated
   Next files committed accidentally.
3. Flag TypeScript safety issues in gameplay code: nullable Phaser objects used
   after destruction, stale scene references, unbounded timers, incorrect union
   keys, or casts that hide manifest/key mismatches.
4. Flag asset pipeline mismatches: changed manifest paths without matching files,
   frame dimensions that do not match spritesheets, JSON metadata out of sync
   with sheets, or README asset lists updated inconsistently.
5. Flag DOM accessibility and UX regressions in the Next app shell, metadata, or
   any future HTML UI. Prefer existing semantic markup and
   `src/app/globals.css` patterns for those surfaces.
6. Flag Phaser canvas UI regressions in overlays, title/game-over screens,
   interactive zones, audio toggle affordances, keyboard/pointer handling, and
   responsive placement. Review these as canvas interactions rather than DOM
   elements.
7. Keep findings actionable. Include the failing scenario, why the changed code
   causes it, and a specific file/line reference.

## Known baseline context

These issues may already exist on `main`; do not block unrelated PRs solely for
them. Do flag a PR when it touches the related area and makes the mismatch worse
or misses a reasonable chance to fix it.

- README controls mention `Space` or `J` for firing, while current runtime input
  uses `Space` plus pointer/click firing.
- README documents regular ammo and several power-ups, but current gameplay also
  includes seeker ammo and seeker projectiles.
- README describes blast as a rare late-game power-up, while current
  `POWERUP_CONFIG.blast` unlocks earlier in the run.
- `src/app/layout.tsx` references `/opengraph-image.png`; verify the public
  asset exists when reviewing metadata or public asset inventory changes.
- `next dev`, `next build`, and type generation can rewrite `next-env.d.ts` and
  create `tsconfig.tsbuildinfo`. Do not include those generated changes unless
  the PR intentionally changes Next type generation behavior.
- `npm run lint` maps to `next lint`, which is not a reliable check in current
  Next versions for this repository. Prefer the build and TypeScript commands
  below for local verification.

## Suggested verification

Use the narrowest checks that prove the changed behavior. For broad changes,
prefer:

```bash
npm ci
npm run build
npx tsc --noEmit
```

For asset tooling changes, also run the specific processor or generator script
that owns the changed asset. For gameplay behavior, include a manual smoke test
in a browser when possible:

1. Load the app.
2. Start a run.
3. Move with WASD or arrow keys.
4. Aim with the pointer and fire with `Space` or click.
5. Collect ammo, hearts, and visible power-ups.
6. Confirm enemies spawn, take damage, and the game-over/restart loop works.

## Managed service deployment checklist

If asked whether Bugbot is fully deployed, distinguish repository context from
the managed service:

- Repository context is present when `.cursor/BUGBOT.md` is merged.
- Managed Bugbot deployment requires Cursor dashboard access, Cursor GitHub App
  access to `fjg-thr/hobgoblin-dungeon`, and Bugbot enabled for this repository.
- A complete live deployment should be smoke-tested by opening or updating a PR
  and confirming the `Cursor Bugbot` check or review comment appears.
- If dashboard, GitHub App, or admin API credentials are unavailable, say that
  service enablement could not be proven from the repository alone.

## Review output style

- Lead with real bugs and regressions, ordered by severity.
- Avoid comments that only restate the diff.
- Avoid blocking on stylistic preferences unless they hide a concrete defect.
- When the diff is safe, say no issues were found and list any verification that
  could not be performed.
