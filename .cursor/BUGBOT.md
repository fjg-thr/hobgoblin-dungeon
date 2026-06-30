# Cursor Bugbot review guide

Use this file as repository-specific context when reviewing PRs for the Hobgoblin Ruin Prototype.

## Project shape

- Next.js App Router application with a browser-only Phaser 4 game.
- `src/app/page.tsx` renders `src/game/GameCanvas.tsx`; keep Phaser imports dynamic and client-only.
- Core gameplay lives in `src/game/scenes/DungeonScene.ts`; map generation lives in `src/game/maps/startingDungeon.ts`.
- Runtime asset loading is driven by `src/game/assets/manifest.ts` and files under `public/assets/**`.
- The public deployment target is Vercel. Avoid Node-only APIs in client/game paths.

## High-signal review areas

### Client boot and lifecycle

- `GameCanvas` must stay a client component and should destroy the Phaser game during React cleanup.
- Do not introduce top-level `phaser` imports in server-rendered modules.
- Preserve resize behavior, pixel-art rendering flags, and one-game-instance guards.

### Gameplay and map correctness

- For `DungeonScene.ts`, check movement, aim, firing, enemy spawn, damage, pickups, scoring, mute, and game-over restart flows together; many systems share scene-level state.
- For map edits, verify tile codes, wall placement, prop blocking, enemy starts, player start, and staircase reachability stay consistent.
- Collision is intentionally custom tile/proximity logic rather than a full physics system; review coordinate conversions carefully.
- Existing docs/code drift should not block unrelated PRs: README mentions `J` firing but current code binds shooting to Space and pointer/click, README omits seeker ammo, and README describes blast as late rare while code controls timing through `POWERUP_CONFIG`.

### Assets and generated content

- If an asset path, sprite sheet, frame size, key, or metadata file changes, confirm `assetManifest` and the matching `public/assets/**` file both change.
- Prefer checking actual image dimensions and JSON frame metadata for sprite-sheet edits.
- Treat `src/game/assets/manifest.ts` as the runtime audio source of truth. `public/assets/audio/audio-manifest.json` is auxiliary consistency data.
- Generated asset tooling includes:
  - `python3 tools/process_assets.py`
  - `node tools/process_actor_death_assets.mjs`
  - `node tools/process_combat_juice_assets.mjs`
  - `python3 tools/process_corporate_goblin_assets.py`
  - `node tools/process_gpt_tile_powerup_assets.mjs`
  - `node tools/process_pickup_intent_effect_assets.mjs`
  - `python3 tools/process_spreadsheet_brute_assets.py`
  - `node tools/generate_audio_sfx.mjs`
  - `node tools/generate_polish_sprites.mjs`
  - `node tools/generate_powerup_sprites.mjs`
  - `node tools/generate_brute_ammo_sprites.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`

### UI, metadata, and accessibility

- DOM UI should follow existing semantic HTML and `src/app/globals.css` patterns; this repo does not currently configure Tailwind.
- Phaser canvas UI needs separate review for pointer zones, keyboard/mouse affordances, responsive placement, readable contrast, and mute/start/game-over interactions.
- `src/app/layout.tsx` references `/opengraph-image.png`; as of this guidance, that tracked public asset may be absent. Flag PRs that add broken metadata references, remove referenced public assets, or drift dimensions/alt text, but do not block unrelated PRs solely for the baseline.

## Verification guidance

- For runtime TypeScript/game changes, prefer:
  - `npm run build`
  - `npx tsc --noEmit --incremental false`
- `npm run lint` is currently not a reliable signal because the project has a lint script but no local ESLint setup for the current Next.js baseline.
- For Markdown-only Bugbot guidance changes, `git diff --check` and a focused diff review are sufficient.
- For asset-generation changes, run the exact touched generator/processor command and inspect the produced asset/metadata diff.

## Managed Bugbot deployment boundary

- Bugbot is a managed Cursor/GitHub App service; this repository file only supplies review context.
- Actual service enablement must be confirmed outside the repo through Cursor dashboard/org settings, GitHub App access to `fjg-thr/hobgoblin-dungeon`, service configuration, or Bugbot Admin API credentials.
- After this file is merged to the default branch, smoke test Bugbot from a PR with a top-level comment such as `cursor review` or `bugbot run`. Use `cursor review verbose=true` or `bugbot run verbose=true` when diagnostic request details are needed.
