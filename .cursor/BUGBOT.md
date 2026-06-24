# Cursor Bugbot review guide

Repository-specific context for Cursor Bugbot reviews of Hobgoblin Ruin PRs.
This complements normal review; it does not enable the managed service.

## Deployment and trigger boundaries

- The managed Cursor Bugbot service must be enabled outside this repo in Cursor
  dashboard/org settings, with GitHub App access to this repository. This file
  only supplies review guidance after it lands on the default branch.
- A PR that adds or changes this file may not be reviewed with the new guidance
  until a later PR.
- If Bugbot is available on a PR, reviewers can request a run with a top-level
  comment containing `cursor review` or `bugbot run`.
- For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true`; verbose mode is for request IDs/log detail and
  troubleshooting, not for a deeper review standard.
- Smoke-check deployment on a live PR by confirming Bugbot posts review output
  or a status.

## Project overview

- Next.js/React/TypeScript app that hosts a Phaser 4 canvas game.
- Main runtime entry points:
  - `src/app/page.tsx` renders `src/game/GameCanvas.tsx`.
  - `src/game/scenes/DungeonScene.ts` owns gameplay, UI overlays, asset
    loading, input, combat, power-ups, audio, and debug display.
  - `src/game/maps/startingDungeon.ts` builds regenerated dungeon layouts.
  - `src/game/assets/manifest.ts` is the runtime source of truth for assets,
    especially `assetManifest.audio`.
- Static art, spritesheet JSON, and audio live under `public/assets`.
- Asset/audio tooling lives under `tools/` and `scripts/`; important generators
  include `tools/generate_audio_sfx.mjs` for procedural SFX and
  `scripts/generate-retro-soundtrack.mjs` for the looping theme.

## Review priorities

- Gameplay: check movement, camera, collision, enemy spawn pressure, projectile
  lifetime, finite ammo, power-up state, damage, scoring, restart, and debug UI.
- Phaser lifecycle: ensure scenes clean up timers, tweens, input handlers,
  audio instances, and game objects; avoid accumulating listeners after restart
  or React remount.
- React/Next: `GameCanvas` should be client-only where needed and resilient to
  Strict Mode/remounts. Keep `layout.tsx` metadata aligned with public assets.
- TypeScript: preserve strict typing, avoid broad `any`, and keep runtime asset
  keys aligned with `assetManifest`.
- UI/UX: this repo has no Tailwind config. For DOM UI, follow semantic markup
  and `src/app/globals.css`. For Phaser canvas UI, verify pointer zones,
  keyboard/mouse affordances, responsive placement, depth, and readable text.
- Assets: when image or JSON metadata changes, verify frame sizes, frame rows,
  animation ranges, transparent backgrounds, and paths in `assetManifest`.
- Audio: when touching audio, verify mute state, unlock/start behavior, volume,
  loop cleanup, and runtime references from `assetManifest.audio`.
  `public/assets/audio/audio-manifest.json` is auxiliary context only.

## Known baseline caveats

- README says `Space` or `J` fires, but current runtime firing is bound to
  `SPACE` plus pointer/click. Flag this for input/docs PRs, but do not block
  unrelated PRs solely for the existing mismatch.
- README covers regular ammo, hearts, quickshot, haste, ward, and blast. The
  code also unlocks seeker ammo/projectiles after progression thresholds.
- README calls blast late and rare, but current `POWERUP_CONFIG` unlocks it
  earlier. Treat this as a baseline mismatch unless a PR touches it.
- `src/app/layout.tsx` references `/opengraph-image.png`; the asset may be
  absent. Only block PRs that change metadata/share-image behavior or worsen it.
- Dependency audit findings may exist in the lockfile baseline. Do not block
  unrelated PRs solely on pre-existing advisories; do flag new dependency risk.

## Suggested verification

Run the smallest set that matches the PR; expand when shared runtime code,
assets, or dependencies change:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Notes:

- `next lint` is not a reliable gate for this Next.js version in this repo.
- `npm run build` or `npx tsc --noEmit` can rewrite `next-env.d.ts` route
  imports or create `tsconfig.tsbuildinfo`; avoid generated churn unless
  type-generation behavior intentionally changes.
- For gameplay changes, smoke-test in browser: start, move with WASD/arrows,
  aim with mouse, fire with Space and click, collect ammo/power-ups/hearts,
  toggle SOUND/MUTED, take damage, die, restart, and toggle F3 debug display.

## Review style

- Lead with concrete bugs, regressions, missing tests, or risky assumptions.
- Cite files/functions and explain the player-visible or maintainer-visible
  impact.
- Keep known baseline issues separate from new regressions.
- Prefer small, actionable fixes over broad refactors unless the PR already
  touches the affected subsystem.
