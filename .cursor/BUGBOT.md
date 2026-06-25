# Cursor Bugbot Review Guide

Use this file as repository-local guidance for Cursor Bugbot reviews. The
managed Bugbot service is enabled outside git through Cursor org settings,
GitHub App repository access, or the Bugbot Admin API. This file only supplies
review context once it is present on the default branch; verify service
enablement with a live PR review when dashboard or API access is available.

## Manual review triggers

- On a pull request, top-level comments `cursor review` and `bugbot run` should
  request a Bugbot review when the managed service has access to this repo.
- For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true` to request extra request IDs or log detail.
- If these commands do not start a review, check Cursor dashboard settings,
  GitHub App installation scope, repository access, and organization policy.

## Project shape

- Next.js app shell lives in `src/app`; the playable game is mounted by
  `src/game/GameCanvas.tsx`.
- Phaser gameplay, input, UI overlays, enemy behavior, pickups, audio hooks,
  and scene state are concentrated in `src/game/scenes/DungeonScene.ts`.
- Runtime assets are declared in `src/game/assets/manifest.ts`; in particular,
  `assetManifest.audio` is the source of truth for audio loaded by the scene.
- `public/assets/audio/audio-manifest.json` is auxiliary consistency data, not
  the runtime loader contract.
- Asset/audio generators and processors live under `tools/` and `scripts/`.
  Notable commands include `tools/generate_audio_sfx.mjs` for procedural SFX
  and `scripts/generate-retro-soundtrack.mjs` for the dungeon theme.

## Review priorities

1. Preserve runtime stability in `DungeonScene.ts`: avoid state leaks between
   restarts, duplicated Phaser listeners, runaway timers, incorrect depth or
   camera math, and collision changes that trap the player.
2. Validate `GameCanvas` and Next.js boundaries: browser-only Phaser code must
   remain client-side, resize handling should clean up listeners, and SSR builds
   must not import browser globals.
3. Keep manifest entries in sync with files under `public/assets`; review image,
   JSON, and audio references together when asset paths change.
4. For gameplay changes, smoke-check start, movement, pointer/click firing,
   Space firing, enemy contact damage, ammo pickups, heart pickups, powerups,
   mute toggling, game over, and restart.
5. For DOM or metadata changes, use semantic elements and the existing
   `src/app/globals.css` patterns. This repo does not currently configure
   Tailwind or shadcn/ui.

## Known baseline caveats

- README says `Space` or `J` fires, but current runtime firing is Space plus
  pointer/click. Do not block unrelated PRs solely for this existing mismatch;
  do flag input or documentation PRs that make it worse.
- README omits seeker ammo while current code unlocks seeker pickups/projectiles
  through progression. Review seeker changes against code behavior, not only
  README text.
- README describes blast as rare late-game, while current `POWERUP_CONFIG`
  unlocks blast earlier. Treat this as existing docs drift unless the PR targets
  powerup balance or documentation.
- `src/app/layout.tsx` references `/opengraph-image.png`; the current baseline
  may not include that asset. Only block changes that touch share-image behavior
  or further regress metadata.
- `npm ci` may report existing Next.js/PostCSS audit findings. Note them, but
  do not block unrelated PRs unless dependency or security work is in scope.

## Verification commands

Ask authors to run the commands relevant to their change:

```bash
npm ci
npm run build
npx tsc --noEmit
```

For asset pipeline changes, also run the exact generator or processor that owns
the touched files, then inspect the generated PNG/JSON/WAV outputs and verify
the manifest references. Avoid relying on `next lint`; this repo's Next version
does not provide a reliable lint baseline for Bugbot gating.

## Review style

- Lead with concrete defects and user-visible regressions, with file and line
  references.
- Separate shipped baseline issues from regressions introduced by the PR.
- Keep recommendations scoped to the touched subsystem; avoid broad refactors
  unless they are necessary to fix the reviewed change.
