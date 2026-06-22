# Cursor Bugbot review guide

Use this repository guidance when reviewing Hobgoblin Ruin Prototype PRs. This
file gives Bugbot local context; enabling the hosted Bugbot service still
depends on Cursor dashboard settings, GitHub App repository access, and a live
PR review smoke check.

## Project shape

- Next.js app-router site with React entry points in `src/app` and
  `src/game/GameCanvas.tsx`.
- The playable game runs in Phaser 4 via `src/game/scenes/DungeonScene.ts`.
- Runtime asset paths are sourced from `src/game/assets/manifest.ts`; keep this
  in sync with files under `public/assets`.
- Dungeon generation and tile collision helpers live in
  `src/game/maps/startingDungeon.ts`.
- Styling is plain CSS in `src/app/globals.css`; Tailwind/ShadCN are not
  configured in this repo.

## Review priorities

- Block PRs that break `npm run build` or `npx tsc --noEmit`.
- Treat `next lint` as unreliable for the current Next version unless the repo
  adds a supported lint script.
- For Phaser changes, review scene lifecycle cleanup, keyboard/pointer handlers,
  resize behavior, depth ordering, object/tween/timer cleanup, and generated map
  collision consistency.
- For gameplay changes, check finite ammo, seeker ammo, power-up unlocks,
  enemy spawning, heart drops, scoring, game-over/reset state, and F3 debug
  overlay behavior.
- For asset changes, verify both image/audio files and matching manifest JSON or
  TypeScript manifest entries are committed. The runtime source of truth for
  loaded audio is `assetManifest.audio`, not only
  `public/assets/audio/audio-manifest.json`.
- For React/metadata changes, check semantic HTML and accessibility around DOM
  controls. Phaser canvas overlays still need keyboard/mouse affordances and
  responsive placement even when they are not normal DOM buttons.
- Keep dependency and tooling hardening separate from gameplay/asset PRs unless
  the PR intentionally changes dependencies.

## Known baselines

- `README.md` says `Space` or `J` fires, but the current scene binds shooting to
  `Space` and pointer/click firing. Do not block unrelated PRs solely for this
  existing controls-doc mismatch.
- Seeker ammo exists in code after 4 kills or 30 seconds, but it is not fully
  documented in the README controls list.
- The README describes blast as rare late-game; current code unlocks blast after
  2 kills or 16 seconds. Only block PRs that worsen or intentionally touch this
  mismatch without resolving it.
- `src/app/layout.tsx` references `/opengraph-image.png`; if the image is absent
  on a baseline, scope findings to PRs that touch metadata/share-image behavior.
- `npm ci` currently reports 2 baseline audit advisories (1 moderate, 1 high).
  Mention them, but do not block unrelated PRs unless the PR changes dependency
  risk.

## Verification commands

Use the smallest relevant set for each PR, and prefer all three for shared game,
asset, or build changes:

```bash
npm ci
npm run build
npx tsc --noEmit
```

If a verification command rewrites generated files such as `next-env.d.ts` or
creates `tsconfig.tsbuildinfo`, confirm whether the PR intended that change
before treating the generated diff as review signal.

Asset generation utilities include:

```bash
python3 tools/process_assets.py
node tools/process_actor_death_assets.mjs
node tools/process_combat_juice_assets.mjs
node tools/generate_powerup_sprites.mjs
node tools/generate_brute_ammo_sprites.mjs
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
```

## Manual smoke checks

- Load the app, start a run, move with WASD/arrow keys, aim with the mouse, fire
  with `Space`, and click to aim/fire once.
- Confirm ammo pickups, seeker ammo once unlocked, quickshot, haste, ward, blast,
  enemy damage/death, heart pickups, score, mute toggle, and game-over restart.
- Resize the viewport and verify the Phaser canvas, HUD, pointer aim, and camera
  remain usable.

## Hosted Bugbot notes

- Top-level PR comments can request a review with `cursor review` or
  `bugbot run`.
- For diagnostics, use `cursor review verbose=true` or
  `bugbot run verbose=true` to surface request IDs and extra log details.
- Guidance in this file applies after it is merged to the default branch; a PR
  adding or changing this file may not be reviewed with the new rules yet.
