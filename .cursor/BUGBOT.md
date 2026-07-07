# Cursor Bugbot Review Guide

Use this repository-specific guide when Cursor Bugbot reviews pull requests for
`fjg-thr/hobgoblin-dungeon`.

## Managed service deployment boundary

- This file gives Bugbot repository context and review priorities. It does not
  by itself prove that the hosted Bugbot service is enabled.
- To verify managed deployment, confirm the Cursor dashboard or organization
  settings, GitHub App repository access for this repo, and any Bugbot Admin API
  credentials or service configuration used by the owner.
- After this file is merged to the default branch, smoke-check a pull request
  review if access is available. A top-level PR comment can manually request a
  review with `cursor review` or `bugbot run`.
- For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true` to request diagnostic output, request IDs, and
  service log detail.
- PRs that add or update `.cursor/BUGBOT.md` may not be reviewed with the new
  rules until the change has landed on the default branch.

## Repository context

- The app is a Next.js/React/TypeScript project that renders a Phaser-powered
  dark isometric dungeon prototype from `src/game/GameCanvas.tsx`.
- Runtime gameplay is concentrated in `src/game/scenes/DungeonScene.ts`, with
  map data in `src/game/maps/startingDungeon.ts` and runtime asset loading in
  `src/game/assets/manifest.ts`.
- The UI that players see is mostly Phaser canvas UI. DOM/metadata changes live
  under `src/app/` and global CSS in `src/app/globals.css`; this repo does not
  currently use Tailwind.
- Runtime audio is loaded from `assetManifest.audio` in
  `src/game/assets/manifest.ts`. `public/assets/audio/audio-manifest.json` is
  auxiliary and should stay consistent when audio assets change.

## Review priorities

1. Catch gameplay regressions in movement, aiming, collision, enemy attacks,
   projectiles, pickups, scoring, audio toggles, and start/game-over flows.
2. Watch for runtime asset manifest drift. Any new or renamed public asset must
   be represented in the relevant manifest and loaded by Phaser with matching
   frame dimensions or atlas metadata.
3. Check responsive canvas UI changes on compact and tiny viewports. The title
   screen, how-to-play modal, HUD, sound toggle, and game-over panel all need
   usable hit zones and readable copy.
4. Preserve keyboard and pointer affordances. Current runtime firing uses Space
   and pointer/click interactions; only block the existing README mention of
   `J` when a PR changes controls or control documentation.
5. Keep README behavior aligned with shipped gameplay. Existing docs cover
   regular ammo, hearts, quickshot, haste, ward, and blast; seeker ammo exists
   in code and should be handled deliberately when touched.
6. For metadata and share-image PRs, verify `src/app/layout.tsx`,
   `public/opengraph-image.png`, image dimensions, alt text, and URLs stay in
   sync. Some sparse checkouts may omit generated binary assets, so state that
   limitation explicitly when the image cannot be inspected locally.
7. Treat dependency or tooling upgrades as high-risk: verify Next/React/TypeScript
   compatibility, the tracked lockfiles, and the Phaser 4 release-candidate pin.

## Gameplay details to keep accurate

- Initial goblins are seeded from `dungeon.enemyStarts`. Additional goblins ramp
  toward the target enemy count, while brutes are gated by
  `BRUTE_UNLOCK_KILLS` and `BRUTE_UNLOCK_MS`.
- `POWERUP_CONFIG` controls unlock gates, spawn weights, and presentation
  metadata. Durations and effect timing live in nearby constants and collection
  logic; blast uses `blastShotReady`.
- Heart pickups restore missing hearts without increasing max health.
- The staircase is currently a visible objective placeholder and does not move
  the player to a new level.

## Generated assets and tooling

- Use `python3 tools/process_assets.py` for the base asset-processing path.
- Use `python3 tools/process_corporate_goblin_assets.py` and
  `python3 tools/process_spreadsheet_brute_assets.py` when those source sheets
  are relevant.
- Use `node tools/process_actor_death_assets.mjs`,
  `node tools/process_combat_juice_assets.mjs`,
  `node tools/process_pickup_intent_effect_assets.mjs`, and related tools under
  `tools/` for generated sprite-sheet changes.
- Use `node tools/generate_audio_sfx.mjs` for procedural SFX and
  `node scripts/generate-retro-soundtrack.mjs` for
  `public/assets/audio/retro_dungeon_theme.wav`.
- Generated PNG/WAV assets can be large; review source prompts, manifests, and
  dimensions together rather than only checking that files exist.

## Local verification commands

Prefer these checks for normal code changes:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

Notes for reviewers:

- `next lint` is not reliable here because newer Next versions no longer expose
  the old lint command in the same way.
- `npm run build` may rewrite `next-env.d.ts`; do not include that generated
  diff unless the PR intentionally changes generated Next typings.
- Plain `npx tsc --noEmit` can create `tsconfig.tsbuildinfo` because incremental
  compilation is enabled. Prefer `--incremental false` and remove the artifact if
  it appears.
- Existing npm audit output may report dependency advisories unrelated to a
  focused gameplay or Bugbot-guidance PR. Flag security regressions introduced by
  the PR separately from pre-existing lockfile findings.

## Bugbot review style

- Prioritize concrete correctness, regression, accessibility, security, and
  verification findings over broad style feedback.
- Include file and line references for actionable findings.
- Do not block unrelated PRs on known existing limitations unless the PR touches
  the affected behavior or documentation.
- When no issue is found, say so and mention any meaningful residual test gap.
