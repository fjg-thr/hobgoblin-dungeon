# Cursor Bugbot review guide

This repository is a Next.js/React/TypeScript prototype for a Phaser 4
isometric dungeon game. Use this guide as repository-specific context when
reviewing pull requests.

## Deployment boundary

- Hosted Cursor Bugbot must be enabled through Cursor org/project settings,
  GitHub App repository access, or the Bugbot Admin API. This file only supplies
  review guidance once it is present on the default branch.
- A pull request that adds or changes this file may not be reviewed with the new
  rules until after merge.
- If managed-service access is unavailable, say so and review only the repository
  diff. Confirm deployment with a live PR smoke review when possible.
- Manual PR triggers can be requested with a top-level comment: `cursor review`
  or `bugbot run`. For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true` to request additional request IDs/log detail.

## Project map

- App entry: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`.
- Phaser mount/lifecycle bridge: `src/game/GameCanvas.tsx`.
- Main gameplay scene: `src/game/scenes/DungeonScene.ts`.
- Dungeon generation/map data: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`, especially
  `assetManifest.audio` for loaded sound files.
- Auxiliary audio manifest: `public/assets/audio/audio-manifest.json`; keep it
  consistent when audio assets change, but it is not the runtime loader.
- Asset/audio tooling lives under `tools/` and `scripts/`, including
  `tools/generate_audio_sfx.mjs` and
  `scripts/generate-retro-soundtrack.mjs`.

## Review priorities

- Protect the Next client boundary. Phaser code and browser globals must stay in
  client-only modules such as `GameCanvas.tsx` or scene files.
- Check lifecycle cleanup for Phaser games, timers, listeners, tweens, pointer
  zones, keyboard bindings, and audio objects.
- For gameplay changes in `DungeonScene.ts`, look for unintended state drift:
  ammo counts, seeker ammo, cooldowns, progression unlocks, pickups, damage,
  depth ordering, collision checks, and restart/reset paths.
- For asset changes, verify manifest keys, frame dimensions, generated JSON, and
  public paths match the files committed to `public/assets`.
- For UI/metadata/DOM changes, prefer existing semantic HTML and
  `src/app/globals.css` patterns. This repo does not currently use Tailwind or
  ShadCN.
- For Phaser UI overlays, check keyboard/mouse affordances, pointer hit areas,
  responsive placement, readable pixel-art scaling, and accessible equivalent
  paths where practical for a canvas game.

## Known baseline notes

- README says staff bolts fire with `Space` or `J`, but current runtime binds
  keyboard shooting to `SPACE`; do not block unrelated PRs for the existing `J`
  mismatch. Smoke-check `Space` and pointer/click firing.
- README documents ammo, heart pickups, quickshot, haste, ward, and blast.
  Runtime code also includes seeker ammo after progression thresholds; treat
  seeker behavior as code-defined unless a docs/control PR changes it.
- README describes blast as rare late-game, while `POWERUP_CONFIG` unlocks blast
  earlier. Do not block unrelated PRs solely for this existing mismatch.
- `src/app/layout.tsx` references `/opengraph-image.png`; the baseline may not
  include that asset. Only block PRs that touch metadata/share images and make
  this worse or claim to fix it without adding the file.
- `npm ci` may report existing Next.js/PostCSS audit advisories. Mention them,
  but do not block an unrelated scoped PR solely on the current baseline.

## Verification to request

For code changes, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Use targeted asset/tool commands when relevant:

```bash
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
```

`next lint` is not reliable for the current Next baseline. If verification
rewrites `next-env.d.ts` or creates `tsconfig.tsbuildinfo`, keep those generated
artifacts out of unrelated review diffs.

## Review style

Lead with concrete correctness, regression, security, accessibility, or test
coverage findings. Include file/line references and explain the user-visible
risk. Keep summaries brief, and explicitly say when no actionable issues are
found.
