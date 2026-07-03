# Cursor Bugbot Review Guide

Use this file as repository-specific context when Cursor Bugbot reviews pull
requests for the Hobgoblin Ruin prototype.

## Deployment and trigger checks

- This file deploys review guidance only. Managed Bugbot enablement still
  depends on Cursor dashboard or organization settings, GitHub App access to
  this repository, and any Admin API credentials or service configuration used
  outside the repo.
- After this lands on the default branch, smoke-test the managed service on a
  pull request by adding a top-level comment with `cursor review` or
  `bugbot run`.
- Use `cursor review verbose=true` or `bugbot run verbose=true` only for
  diagnostics, such as request IDs and detailed troubleshooting logs.
- If Bugbot does not respond, do not treat this file as proof that the service
  is enabled. Verify the external Cursor and GitHub App configuration.
- Pull requests that add or modify this file may not be reviewed with the new
  rules until the changes are merged into the default branch.

## Project context

- The app is a Next.js, React, TypeScript, and Phaser game prototype.
- Runtime gameplay lives mainly in `src/game/scenes/DungeonScene.ts`.
- Next app shell and metadata live in `src/app/`.
- Runtime asset loading is driven by `src/game/assets/manifest.ts`.
- `public/assets/audio/audio-manifest.json` is auxiliary; keep it consistent
  when audio files change, but do not treat it as the runtime source of truth.
- Map generation helpers live in `src/game/maps/startingDungeon.ts`.
- Generated or processed assets live under `public/assets/`, with tooling under
  `tools/` and `scripts/`.

## Review priorities

Prioritize concrete user-visible regressions over style-only comments:

1. Runtime crashes, broken builds, TypeScript errors, missing assets, or
   imports that fail in a clean checkout.
2. Gameplay regressions in movement, collision, camera follow, shooting, ammo,
   pickups, power-ups, health, enemy behavior, scoring, game over, restart, or
   debug controls.
3. Phaser lifecycle issues: duplicate input handlers, timers, tweens, sounds,
   sprites, or containers that survive restart, resize, shutdown, or scene
   reset paths.
4. Asset manifest mismatches: changed paths, dimensions, frame counts, audio
   keys, or metadata without matching files and loader changes.
5. Responsive UI regressions in the start screen, how-to-play modal, HUD, mute
   button, title/game-over screens, and compact or tiny viewport branches.
6. Metadata and public asset regressions that break social previews or public
   references.

Avoid broad refactor requests unless the change creates a clear maintainability
risk in the touched code.

## Repo-specific review notes

- `DungeonScene.ts` currently binds keyboard firing to `SPACE`; pointer or
  click firing also queues a shot. README text mentions `Space` or `J`, but the
  runtime does not bind `J`. Treat that as an existing docs/runtime mismatch
  unless a PR touches controls or documentation.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and
  blast. Current runtime also supports seeker ammo after progression gates.
  Review seeker changes against code behavior, not README coverage alone.
- README calls blast a rare late-game power-up, while current unlock timing is
  controlled by `POWERUP_CONFIG`. Treat the existing wording/code mismatch as
  context, not a blocker for unrelated PRs.
- This repo does not currently configure Tailwind. For DOM UI changes, prefer
  semantic markup and existing `src/app/globals.css` patterns. For Phaser UI,
  review canvas-specific pointer zones, keyboard/mouse affordances, responsive
  layout, and readable on-canvas text.
- The start screen and how-to-play modal are Phaser-rendered. Changes should
  preserve compact viewport layout, modal close behavior, start/restart flows,
  and copy that matches runtime input.
- `src/app/layout.tsx` references `/opengraph-image.png` with dimensions and
  alt text. Metadata or share-image changes should keep the public file,
  dimensions, alt text, OpenGraph data, and Twitter data consistent.

## Asset and audio guidance

- When a PR adds, removes, or renames assets, confirm both the file under
  `public/assets/` and the relevant manifest or loader entry are updated.
- For sprite sheets, verify frame dimensions and frame ranges in Phaser
  animation setup match the generated image and JSON metadata.
- For runtime audio, verify `assetManifest.audio` keys and file paths in
  `src/game/assets/manifest.ts`; keep `public/assets/audio/audio-manifest.json`
  consistent when touched.
- Useful asset tooling:
  - `python3 tools/process_assets.py`
  - `python3 tools/process_corporate_goblin_assets.py`
  - `python3 tools/process_spreadsheet_brute_assets.py`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`
  - `node tools/generate_powerup_sprites.mjs`
  - `node tools/generate_brute_ammo_sprites.mjs`
  - `node tools/process_pickup_intent_effect_assets.mjs`
  - `node tools/process_combat_juice_assets.mjs`
  - `node tools/process_actor_death_assets.mjs`

## Verification expectations

For source changes, prefer:

```bash
npm run build
npx tsc --noEmit --incremental false
```

`next lint` is not reliable in this Next 16 project, so do not require it as a
blocking check unless the repo scripts are updated.

For asset-only changes, ask for targeted checks that prove the changed files
exist and match manifest metadata. For gameplay changes, request a browser smoke
test when possible: start the app, open `http://localhost:3000`, start a run,
move, aim, fire with Space and pointer/click, pick up ammo or power-ups when
available, toggle sound, resize the viewport, and verify restart/game-over paths
if those areas changed.

For Bugbot-guidance-only deployment PRs, the expected code diff is limited to
`.cursor/BUGBOT.md`. Reasonable verification includes:

```bash
git diff --check origin/main...HEAD
test "$(git diff --name-only origin/main...HEAD)" = ".cursor/BUGBOT.md"
test -s .cursor/BUGBOT.md
python3 - <<'PY'
from pathlib import Path
text = Path(".cursor/BUGBOT.md").read_text()
required = [
    "cursor review",
    "bugbot run",
    "src/game/scenes/DungeonScene.ts",
    "src/game/assets/manifest.ts",
    "npm run build",
    "npx tsc --noEmit --incremental false",
]
missing = [item for item in required if item not in text]
if missing:
    raise SystemExit(f"missing required guidance: {missing}")
text.encode("ascii")
PY
```
