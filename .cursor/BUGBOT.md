# Cursor Bugbot review guidance

Use this file as repository-specific context when Cursor Bugbot reviews pull
requests for Hobgoblin Ruin, a Next.js/React/TypeScript app that embeds a
Phaser 4 dungeon prototype.

## Deployment and trigger boundaries

- This file provides review instructions only. It cannot prove that the hosted
  Bugbot service is enabled; confirm that in Cursor dashboard/org settings,
  Cursor GitHub App repository access, or Bugbot Admin API credentials.
- Hosted Bugbot uses these rules after they are merged to the default branch.
  PRs adding or editing this file may not be reviewed with the new guidance.
- Manual PR review triggers supported by Cursor docs: comment `cursor review`
  or `bugbot run` at the top level of a PR. For troubleshooting/request IDs and
  extra logs, use `cursor review verbose=true` or `bugbot run verbose=true`.
- A live PR smoke review is the only repository-visible proof that managed
  Bugbot is reviewing code.

## Project review priorities

- Treat `src/game/scenes/DungeonScene.ts` as the gameplay source of truth for
  movement, collision, aiming, combat, pickups, sound, HUD overlays, and the
  start/how-to-play/game-over flows. Watch for Phaser lifecycle leaks, stale
  event handlers, uncapped timers/tweens, depth ordering regressions, and
  state that is not reset by restarts.
- `src/game/GameCanvas.tsx` dynamically imports Phaser on the client and owns
  `Phaser.Game` creation/destruction. Reject changes that instantiate Phaser
  during server render, create duplicate games on React remount, or break
  resize/pixel-art settings.
- `src/game/assets/manifest.ts` is the runtime asset manifest, including
  `assetManifest.audio`. Keep manifest keys, dimensions, and paths aligned with
  files under `public/assets`. `public/assets/audio/audio-manifest.json` is
  auxiliary consistency data, not the runtime loader source.
- Review generated asset workflows carefully. Asset processors/generators live
  in `tools/`, including `tools/generate_audio_sfx.mjs`; the soundtrack
  generator is `scripts/generate-retro-soundtrack.mjs`.
- This repo currently uses plain CSS in `src/app/globals.css`, not Tailwind or
  shadcn/ui. For DOM changes, follow semantic HTML and existing CSS patterns.
  For Phaser UI, review canvas hit zones, keyboard/pointer affordances,
  responsive placement, and accessibility limitations of canvas-only controls.
- `src/app/layout.tsx` references `/opengraph-image.png`, but the file is not
  present on the current baseline. Flag PRs that touch metadata/share images
  and worsen this, but do not block unrelated PRs solely for the baseline.

## Gameplay baseline notes

- README says firing works with Space or J, but current code binds shooting to
  Space plus pointer/click firing. Treat the J mismatch as existing unless the
  PR changes controls or docs.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast.
  Current code also includes seeker ammo/projectiles behind progression
  thresholds. Review seeker behavior against code, and do not assume README is
  complete for seeker features.
- README calls blast a rare late-game power-up; current `POWERUP_CONFIG`
  unlocks it by code-defined progression. Treat mismatches as baseline unless a
  PR intentionally updates power-up balance/docs.

## Verification expectations

- Prefer `npm run build` and `npx tsc --noEmit` for code changes. Next 16 makes
  `next lint`/`npm run lint` unreliable in this repo, so do not require it as a
  blocking check unless the script has been fixed.
- For asset/audio changes, also run the specific relevant generator or
  processor, then verify manifest paths and generated files are committed.
- `npm ci` may report baseline audit advisories for dependencies; mention them
  when relevant, but do not block unrelated PRs solely for existing advisories.
- Next may rewrite `next-env.d.ts` route type imports and create
  `tsconfig.tsbuildinfo` during verification. Treat this as generated churn
  unless the PR intentionally changes Next type generation.

## Review style

- Prioritize concrete correctness, gameplay regressions, broken builds,
  lifecycle/resource leaks, asset path mismatches, and user-facing control/audio
  regressions.
- Include exact file/line references and a minimal reproduction or verification
  command when possible.
- Keep comments focused on issues introduced by the PR. Note known baselines as
  context instead of reporting them as new defects.
