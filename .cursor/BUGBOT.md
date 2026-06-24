# Cursor Bugbot review guide

This file gives Cursor Bugbot repository-specific context after it is merged to
the default branch. It does not enable the hosted Bugbot service by itself.
Confirm service enablement through Cursor dashboard or organization settings,
GitHub App repository access, or the Bugbot Admin API, then smoke-test on a live
pull request. For manual PR reviews, comment `cursor review` or `bugbot run`.
For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true`
to request extra log detail and request IDs.

## Project shape

- Next.js app with a client-only Phaser game canvas.
- Entry points: `src/app/page.tsx`, `src/app/layout.tsx`, and
  `src/game/GameCanvas.tsx`.
- Main gameplay lives in `src/game/scenes/DungeonScene.ts`; expect a large,
  stateful scene with input, spawning, combat, UI, audio, and start/game-over
  overlays in one file.
- Map data is in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths come from `src/game/assets/manifest.ts`. Treat
  `assetManifest.audio` as the source of truth for audio loaded by the scene.
  `public/assets/audio/audio-manifest.json` is auxiliary consistency data.
- Asset tooling is under `tools/`; soundtrack generation is in
  `scripts/generate-retro-soundtrack.mjs`.

## What to prioritize in reviews

1. Runtime safety for Phaser lifecycle and browser-only APIs. `GameCanvas`
   dynamically imports Phaser and destroys the game on unmount; preserve this
   pattern when changing boot or scene loading code.
2. Gameplay regressions in `DungeonScene.ts`: movement, aiming, `SPACE` and
   pointer/click firing, ammo consumption and pickups, enemy spawning,
   collision, power-up timing, health, score, pause/start/game-over overlays,
   and the sound toggle.
3. Asset manifest correctness. Every manifest path or frame size change should
   match files in `public/assets/**` and the sprite-sheet metadata JSON.
4. Audio changes. Check preload keys, mute behavior, loop volume, and generated
   WAV references. Do not require regenerated audio unless the PR changes audio
   sources, manifests, or generator scripts.
5. DOM and metadata changes. This project does not currently use Tailwind or
   ShadCN. For normal React DOM changes, prefer semantic HTML and the existing
   `src/app/globals.css` style patterns. For Phaser UI, review canvas-specific
   pointer zones, keyboard affordances, responsive placement, and accessibility
   limitations.

## Known baseline caveats

- The README says `Space` or `J` fires, but current scene behavior binds
  shooting to `SPACE` plus pointer/click firing. Flag this only for PRs that
  touch controls or docs, or that worsen the mismatch.
- README power-up text does not document seeker ammo, while the scene unlocks
  seeker pickups/projectiles through progression. Treat that as existing
  behavior unless the PR changes ammo, pickups, or docs.
- README describes blast as late and rare, but the current `POWERUP_CONFIG`
  can unlock it earlier. Do not block unrelated PRs solely on this drift.
- `src/app/layout.tsx` references `/opengraph-image.png`; there may be no
  matching asset in the current baseline. Only block PRs that touch metadata or
  share images and leave this broken or worse.
- `npm ci` may report existing Next.js/PostCSS audit advisories. Note them, but
  do not fail unrelated reviews solely on the current dependency baseline.
- `next lint` is not reliable with the current Next version. Prefer the
  verification commands below.

## Verification to request or run

- `npm ci`
- `npm run build`
- `npx tsc --noEmit`
- When asset metadata or generated sprites change, also run the relevant script:
  `npm run process:assets`, `npm run process:death-assets`,
  `npm run process:combat-juice`, `npm run generate:powerups`,
  `npm run generate:combat-assets`, `node tools/generate_audio_sfx.mjs`, or
  `node scripts/generate-retro-soundtrack.mjs`.

Build and typecheck can rewrite `next-env.d.ts` or create
`tsconfig.tsbuildinfo`; do not treat those generated files as intentional
changes unless the PR is specifically changing Next typing behavior.

## Review style

- Lead with actionable correctness, runtime, and regression risks.
- Cite file paths and exact behavior. Prefer focused suggestions over broad
  refactors for the large Phaser scene.
- Distinguish shipped baseline issues from regressions introduced by the PR.
- If hosted Bugbot enablement cannot be verified from available credentials,
  state that repository guidance is present but managed-service activation still
  needs dashboard, GitHub App, Admin API, or live PR smoke-test confirmation.
