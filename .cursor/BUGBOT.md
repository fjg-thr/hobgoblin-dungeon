# Cursor Bugbot Review Guide

This file provides repository guidance for Cursor Bugbot. It does not enable
the hosted Bugbot service by itself.

## Deployment and trigger checks

- Confirm the Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon` and
  Bugbot is enabled for the repo in the Cursor Bugbot dashboard.
- If enablement is managed by automation, confirm the Cursor Admin API update
  has been run for this repository with `enabled: true` and valid team admin
  credentials.
- After this file lands on the default branch, smoke-test a live pull request
  review. Top-level PR comments can trigger reviews with `cursor review` or
  `bugbot run`.
- For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true`; include request IDs or service logs when reporting
  deployment issues.
- If the hosted service is unavailable in the current environment, report that
  only repo-side review guidance was deployed and that live enablement remains
  external to git.

## Review priorities for this repo

- Treat the app as a Next.js React shell around a Phaser game scene. Changes in
  `src/game/scenes/DungeonScene.ts` can affect movement, combat, spawning,
  collision, camera behavior, HUD, audio, and game state at once.
- `src/game/GameCanvas.tsx` dynamically imports Phaser and owns the game
  lifecycle. Watch for SSR/browser-boundary mistakes, duplicate game instances,
  leaked scenes, and resize or cleanup regressions.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded
  sprites, effects, UI, and audio. Keep manifest keys, frame sizes, public asset
  paths, and animation setup in sync.
- `public/assets/audio/audio-manifest.json` is auxiliary; do not treat it as the
  runtime loader. If audio changes, compare it with `assetManifest.audio`.
- Generated asset and audio tooling lives in `tools/` and `scripts/`, including
  `tools/generate_audio_sfx.mjs` and
  `scripts/generate-retro-soundtrack.mjs`. Generated outputs should match the
  checked-in metadata and Phaser frame dimensions.
- Review DOM/metadata changes with standard React and accessibility concerns.
  This repo does not currently configure Tailwind or shadcn/ui; Phaser canvas
  UI should be reviewed for pointer zones, keyboard/mouse affordances,
  responsive placement, and readable overlays.

## Known baseline context

- README says `Space` or `J` fires, while current gameplay binds keyboard
  shooting to `Space` plus pointer/click firing. Do not block unrelated PRs for
  this mismatch, but flag PRs that touch controls or docs and leave them
  inconsistent.
- Current gameplay includes seeker ammo/projectiles after progression
  thresholds, but README does not document seeker ammo. Flag only relevant
  gameplay or documentation changes.
- README describes blast as rare late-game, while the current `POWERUP_CONFIG`
  may unlock it earlier. Treat this as existing docs/code drift unless a PR
  intentionally changes power-up progression.
- `src/app/layout.tsx` references `/opengraph-image.png`; if the asset is still
  absent, only block metadata/share-image PRs that worsen or rely on it.
- `npm ci` may report existing baseline advisories from upstream packages.
  Security PRs should address them, but unrelated PRs should not be blocked
  solely on the current audit baseline.

## Verification expectations

Prefer fresh commands that match the touched area:

- `npm ci`
- `npm run build`
- `npx tsc --noEmit --incremental false`
- `npm run process:assets`
- `npm run process:death-assets`
- `npm run process:combat-juice`
- `npm run generate:powerups`
- `npm run generate:combat-assets`
- `node tools/generate_audio_sfx.mjs`
- `node scripts/generate-retro-soundtrack.mjs`

`next lint` is not a reliable gate for the current Next version in this repo.
If verification rewrites generated files such as `next-env.d.ts` or
`tsconfig.tsbuildinfo`, ensure the final diff only contains intentional changes.

## Review style

- Lead with concrete findings and file/line references.
- Prioritize bugs, regressions, missing verification, and mismatches between
  docs, manifests, assets, and gameplay behavior.
- Keep comments scoped to the changed files and their direct runtime effects.
