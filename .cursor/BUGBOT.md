# Cursor Bugbot Review Guide

This repository uses Cursor Bugbot as a managed code-review service. This file
provides repository-specific review instructions; it does not itself enable the
hosted service. Service enablement must be confirmed in Cursor dashboard or org
settings, GitHub App repository access, or the Bugbot Admin API if credentials
are available.

After this file is merged to the default branch, Bugbot should apply it to future
pull requests. PRs that add or edit this file may not be reviewed with the new
instructions yet.

## Manual triggers

- In a pull request, use a top-level comment containing `cursor review` or
  `bugbot run` to request a review.
- For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true` to request extra diagnostic output such as request
  IDs and log detail.

## Review priorities

Focus review on runtime behavior for a Next.js, React, TypeScript, and Phaser
browser game:

- `src/game/scenes/DungeonScene.ts` is the main gameplay surface. Check spawn
  pacing, collision, input handling, projectile and pickup lifecycles, audio
  loading, scene cleanup, and Phaser object destruction.
- `src/game/GameCanvas.tsx` owns client-only Phaser bootstrapping. Watch for
  server-side `window` access, duplicate game instances, cancellation races, and
  cleanup regressions.
- `src/game/assets/manifest.ts` is the runtime asset source of truth, including
  `assetManifest.audio`. `public/assets/audio/audio-manifest.json` is auxiliary
  and should not be treated as the loader source unless the runtime changes.
- `src/game/maps/startingDungeon.ts` defines tile semantics and procedural map
  behavior. Review map changes for blocked tiles, prop collision, reachable
  paths, and tile asset key consistency.
- `src/app/layout.tsx`, `src/app/page.tsx`, and `src/app/globals.css` cover the
  surrounding app shell and metadata. This project does not currently configure
  Tailwind or ShadCN, so review DOM styling against existing CSS patterns rather
  than requiring those tools.

For Phaser UI and canvas interactions, check responsive placement, pointer zones,
keyboard and mouse affordances, start/game-over flow, mute behavior, and debug
overlay behavior. Do not assume normal DOM accessibility fixes apply inside the
canvas without matching Phaser interaction support.

## Verification commands

Ask authors to run the narrowest relevant command set for their change. For
general code changes, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Asset or audio generator changes should also run the touched script explicitly,
for example:

```bash
python3 tools/process_assets.py
node tools/process_actor_death_assets.mjs
node tools/process_combat_juice_assets.mjs
node tools/generate_powerup_sprites.mjs
node tools/generate_brute_ammo_sprites.mjs
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
```

`next lint` is not reliable for this baseline; do not block a PR solely because
it does not use that command. Next and TypeScript verification may generate or
rewrite `next-env.d.ts` and `tsconfig.tsbuildinfo`; require those artifacts to be
restored or intentionally committed.

## Known baseline caveats

Do not block unrelated PRs only for these existing mismatches. Do flag changes
that make them worse or claim to fix them without doing so.

- README says firing uses `Space` or `J`, but current runtime guidance in
  `DungeonScene.ts` emphasizes `Space` plus pointer/click firing.
- Code includes seeker ammo unlocks and seeker projectiles, while README focuses
  on regular ammo and documented powerups.
- README describes blast as a rare late-game powerup; code may unlock blast
  earlier through `POWERUP_CONFIG`.
- `src/app/layout.tsx` references `/opengraph-image.png`; the matching public
  image may be absent on the current baseline.
- `npm ci` can report existing dependency audit advisories from the current
  Next/PostCSS dependency baseline. Mention them, but only block dependency PRs
  or changes that introduce or worsen the issue.

## Review style

Prioritize actionable defects with file and line references. Separate critical
runtime breakages from existing baseline drift. When a change touches generated
assets, verify that source prompts, processors, manifests, and committed outputs
stay in sync. Prefer small, concrete recommendations over broad refactors.
