# Cursor Bugbot review guidance

This repository is a Next.js/React/TypeScript prototype that boots a Phaser
dungeon scene from `src/game/GameCanvas.tsx` into `src/game/scenes/DungeonScene.ts`.
Use this file as repository-specific review context after it is merged to the
default branch. PRs that add or update this file may not be reviewed with these
new instructions yet.

## Deployment and trigger checks

- This file gives Bugbot review guidance only. It cannot prove that the hosted
  Cursor Bugbot service is enabled for the repository.
- To verify managed deployment, confirm Cursor dashboard or organization Bugbot
  settings, Cursor GitHub App repository access, and Bugbot Admin API credentials
  if available. Finish with a live PR smoke review when possible.
- Manual PR triggers should work from a top-level PR comment with `cursor review`
  or `bugbot run`. Use `cursor review verbose=true` or
  `bugbot run verbose=true` only for diagnostic output, request IDs, or log
  detail when troubleshooting.

## Review priorities

- Treat `src/game/scenes/DungeonScene.ts` as the gameplay source of truth for
  movement, collisions, spawning, power-ups, projectiles, scoring, audio, and
  Phaser canvas UI. Look for lifecycle leaks, duplicate listeners, stale
  containers, unsafe async assumptions, and state that is not reset between runs.
- Treat `src/game/GameCanvas.tsx` as the Next/React integration boundary. Review
  dynamic Phaser imports, mount/unmount cleanup, resize behavior, and client-only
  assumptions.
- `src/game/assets/manifest.ts` is the runtime asset and audio source of truth,
  especially `assetManifest.audio`. `public/assets/audio/audio-manifest.json` is
  auxiliary/consistency-only unless a PR explicitly wires runtime loading to it.
- For asset or audio changes, check the relevant manifest JSON and generator or
  processor scripts under `tools/` and `scripts/`, including
  `tools/generate_audio_sfx.mjs` and
  `scripts/generate-retro-soundtrack.mjs`.
- This repo does not currently configure Tailwind. For DOM/metadata changes,
  review semantic HTML, accessibility, and existing `src/app/globals.css`
  patterns. For Phaser UI, review pointer zones, keyboard/mouse affordances,
  responsive placement, and canvas-specific usability.

## Known baselines to avoid noisy findings

- Runtime shooting is bound to `Space` plus pointer/click firing. The README also
  mentions `J`; do not block unrelated PRs solely for this existing controls
  docs drift.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and
  blast, but currently omits seeker ammo while code unlocks seeker pickups and
  projectiles after progression thresholds.
- README describes blast as rare late-game, while `POWERUP_CONFIG` unlocks blast
  earlier. Treat this as baseline drift unless a PR intentionally changes
  power-up progression or docs.
- `src/app/layout.tsx` references `/opengraph-image.png`, but the current
  baseline has no matching `public/opengraph-image.png` or app
  `opengraph-image.*`. Only flag PRs that touch metadata/share-image behavior or
  make this worse.
- `next lint` is not reliable with the current Next version because the script
  still calls `next lint`. Prefer the verification commands below.
- `npm ci` currently reports baseline audit advisories. Do not block unrelated
  PRs solely on pre-existing dependency advisories unless the PR changes
  dependencies or security posture.

## Verification guidance

Prefer focused checks for touched files, then run:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check
```

After Next build/typecheck, restore generated `next-env.d.ts` route-type churn
and remove untracked `tsconfig.tsbuildinfo` unless the PR intentionally changes
generated TypeScript behavior.

## Review style

Lead with concrete, actionable bugs and regressions. Include file/line
references, explain user impact, and distinguish shipped behavior from known
prototype limitations. Avoid broad refactors or asset-generation requests unless
they are necessary for the changed code to work safely.
