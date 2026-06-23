# Cursor Bugbot review guide

Use this guide when Cursor Bugbot reviews pull requests for this repository.
The managed Bugbot service is enabled outside the repo through Cursor org/project
settings and GitHub App repository access; this file only supplies repo-specific
review context after it is merged to the default branch.

## Triggers and deployment checks

- Manual PR triggers: comment `cursor review` or `bugbot run`.
- Verbose diagnostics: `cursor review verbose=true` or `bugbot run verbose=true`
  to collect request IDs and detailed logs when a review does not appear.
- To confirm deployment, verify Cursor dashboard/org settings, GitHub App access
  for `fjg-thr/hobgoblin-dungeon`, and run a live PR smoke review when possible.
- PRs that add or edit this file may not be reviewed with the new rules until
  the change reaches the default branch.

## Repository shape

- Next.js app under `src/app`, with a browser-only Phaser game mounted by
  `src/game/GameCanvas.tsx`.
- Main gameplay logic is in `src/game/scenes/DungeonScene.ts`; map data is in
  `src/game/maps/startingDungeon.ts`.
- Runtime asset paths come from `src/game/assets/manifest.ts`. Treat
  `public/assets/audio/audio-manifest.json` as auxiliary consistency data only.
- Generated/process tooling lives in `tools/` and `scripts/`, including
  `tools/generate_audio_sfx.mjs` for SFX and
  `scripts/generate-retro-soundtrack.mjs` for the looping theme.

## Review priorities

- Catch regressions in gameplay state: start/game-over resets, ammo counts,
  seeker ammo, power-up timers, blast charge use, enemy cleanup, score, and
  health/ward interactions.
- For Phaser UI and canvas interactions, check pointer zones, keyboard/mouse
  affordances, responsive placement, camera/depth ordering, and teardown of
  listeners/tweens/timers on restart or scene shutdown.
- For Next/React changes, keep client-only Phaser code out of server components
  and preserve metadata behavior. This repo does not use Tailwind; follow
  existing semantic HTML and `src/app/globals.css` patterns for DOM UI.
- For assets/audio, verify new manifest entries match committed files and that
  sprite frame sizes, frame rows, keys, and generated metadata stay consistent.
- Avoid blocking unrelated PRs solely on baseline dependency audit advisories.

## Known baseline context

- README says `Space` or `J` fires, but current runtime binds keyboard shooting
  to `Space`; pointer/click firing is also supported. Only flag this when a PR
  touches controls or control docs.
- Code includes seeker ammo unlocks after kill/time milestones, while README
  does not document seeker ammo yet.
- README calls blast a rare late-game power-up, while current code unlocks blast
  early (`POWERUP_CONFIG.blast`). Treat this as an existing docs/code mismatch
  unless a PR intentionally changes power-up progression.
- `src/app/layout.tsx` references `/opengraph-image.png`; if the image is still
  absent, only flag PRs that touch metadata/share-image behavior or worsen it.

## Suggested verification

- `npm ci`
- `npm run build`
- `npx tsc --noEmit`
- For asset/tooling PRs, run the specific generator or processor touched by the
  change and verify the committed outputs.

Do not claim the managed Bugbot service is enabled from this file alone; report
the external verification boundary when dashboard or GitHub App access is not
available.
