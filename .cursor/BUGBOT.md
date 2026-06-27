# Cursor Bugbot review guide

This file gives Cursor Bugbot repository-specific context for reviewing pull
requests in `fjg-thr/hobgoblin-dungeon`. It does not enable the managed Bugbot
service by itself. Confirm service deployment in Cursor dashboard or org
settings, GitHub App repository access, and any Bugbot Admin API configuration
outside this repo. After this file reaches the default branch, smoke-test a PR
review if you need proof of live service behavior.

Bugbot can be manually triggered on PRs with a top-level `cursor review` or
`bugbot run` comment. Use `cursor review verbose=true` or
`bugbot run verbose=true` only when you need service diagnostics such as request
IDs and log detail.

## Project shape

- Next.js App Router host: `src/app/page.tsx`, `src/app/layout.tsx`,
  `src/app/globals.css`.
- Client-only Phaser bridge: `src/game/GameCanvas.tsx`, which dynamically loads
  Phaser and `DungeonScene`.
- Main gameplay: `src/game/scenes/DungeonScene.ts`. Treat changes here as high
  blast-radius because input, preload, combat, UI, audio, and debug behavior are
  concentrated in one scene.
- Map generation: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`; public JSON
  manifests and source images are auxiliary pipeline outputs unless code loads
  them explicitly.

## Review priorities

1. Block build/runtime regressions: server/client boundary mistakes, browser API
   use outside client-only code, Phaser lifecycle leaks, failed preloads, or
   unsafe assumptions around canvas resize and teardown.
2. Check gameplay changes against controls, ammo, enemy pressure, pickups,
   power-ups, scoring, health, and game-over flow. Exercise pointer/click fire,
   Space fire, WASD/arrows, mute, restart, and F3 debug when relevant.
3. Keep asset references synchronized. If code adds, renames, or removes assets,
   update `assetManifest`, `public/assets/**`, README asset docs, and generator
   scripts together.
4. For DOM/metadata/UI changes, prefer semantic HTML and existing
   `src/app/globals.css` conventions. This repo does not currently use
   Tailwind or shadcn/ui.
5. Do not approve generated-file churn unless the PR intentionally regenerates
   assets or Next type files. `next-env.d.ts` can be rewritten by local Next
   commands and should normally stay unchanged.

## Known baseline caveats

- `npm run lint` maps to `next lint`, which is unreliable on current Next
  versions. Prefer `npm run build` plus `npx tsc --noEmit --incremental false`
  for normal code review.
- `npm ci` currently reports baseline dependency audit advisories. Flag new
  dependency risk, but do not block unrelated PRs solely on existing advisories.
- README mentions `Space` or `J` to fire, while current code binds Space and
  pointer/click firing. Treat that as existing docs drift unless the PR touches
  controls or docs.
- Current code includes seeker ammo behavior that README does not document.
  Review seeker changes against code-defined behavior, and ask for docs updates
  when a PR intentionally changes that gameplay.
- README describes blast as a rare late-game power-up; current unlock/weighting
  is governed by `POWERUP_CONFIG` in `DungeonScene.ts`.
- Both `package-lock.json` and `pnpm-lock.yaml` exist, but README documents npm.
  Keep lockfile changes deliberate and package-manager scoped.

## Verification guidance

For most source changes, request or run:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

For asset or generator changes, also run the exact affected script, for example:

```bash
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
```

If feasible, perform a browser smoke test at `/`: the Phaser canvas boots,
movement and firing work, audio mute toggles, pickups collect, and restart works
after game over.
