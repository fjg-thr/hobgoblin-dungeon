# Cursor Bugbot review guide

Use this guide when reviewing pull requests for this repository. It gives Cursor
Bugbot project-specific context; hosted Bugbot still must be enabled outside the
repo through the Cursor dashboard, Cursor GitHub App repository access, or the
Bugbot Admin API. A repository commit cannot prove that managed service state.

Manual GitHub PR triggers supported by Cursor docs include top-level comments
`cursor review` and `bugbot run`. For diagnostics, use `cursor review
verbose=true` or `bugbot run verbose=true`.

## Project map

- Next.js App Router shell: `src/app/page.tsx`, `src/app/layout.tsx`,
  `src/app/globals.css`.
- React/Phaser bridge: `src/game/GameCanvas.tsx` dynamically imports Phaser and
  `DungeonScene`, then destroys the Phaser game on unmount.
- Main runtime logic: `src/game/scenes/DungeonScene.ts`.
- Dungeon generation/types: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`.
- Public generated assets: `public/assets/**`; supporting generators/processors
  live in `tools/` and `scripts/`.

## Review priorities

1. **Runtime asset integrity.** Any changed asset path, key, frame size,
   metadata JSON, animation row, or audio file should remain aligned with
   `assetManifest` and every `DungeonScene` loader/animation reference. The
   auxiliary `public/assets/audio/audio-manifest.json` is not what Phaser loads.
2. **Phaser lifecycle and reset safety.** Watch for duplicate listeners, timers,
   tweens, audio instances, stale game objects, or scene state that survives
   restart/game-over flows. Prefer explicit cleanup and reset paths.
3. **Gameplay invariants.** Check movement/collision in isometric tile space,
   enemy spawn pressure, pickup caps, ammo counts, power-up expiry, damage
   invulnerability, camera bounds, and responsive UI placement.
4. **Existing doc/runtime mismatches.** Do not block unrelated PRs solely because
   the README says `Space` or `J` fires while current keyboard code binds
   `SPACE`, because seeker ammo exists in code but is not documented, or because
   README blast rarity does not exactly match `POWERUP_CONFIG`. Do flag PRs that
   touch these areas and make the mismatch worse.
5. **Metadata/share assets.** `src/app/layout.tsx` references
   `/opengraph-image.png` with 1360x752 dimensions and alt text. Metadata PRs
   should keep the referenced public asset, dimensions, and descriptions in sync.
6. **Dependency/tooling changes.** This repo tracks both `package-lock.json` and
   `pnpm-lock.yaml`; dependency PRs should keep the relevant lockfiles coherent.
   Phaser is pinned to `4.0.0-rc.4`, so API changes need Phaser 4 rc awareness.
7. **UI/accessibility.** The app is mostly a Phaser canvas with a minimal DOM
   shell and plain CSS, not Tailwind/ShadCN. For DOM changes, review semantic
   markup and accessibility. For canvas UI, review keyboard/mouse affordances,
   hit zones, readable text, and responsive placement.

## Generated assets and audio

Generated files should come with the matching source/processor updates when
applicable. Useful commands and entry points:

- `npm run process:assets`
- `npm run process:death-assets`
- `npm run process:combat-juice`
- `npm run generate:powerups`
- `npm run generate:combat-assets`
- `node tools/generate_audio_sfx.mjs`
- `node scripts/generate-retro-soundtrack.mjs`
- `python3 tools/process_corporate_goblin_assets.py`
- `python3 tools/process_spreadsheet_brute_assets.py`

Flag generated sprite-sheet JSON/PNG drift, incorrect frame dimensions, missing
transparent backgrounds, non-nearest-neighbor scaling artifacts, and references
to assets that are not tracked under `public/assets`.

## Verification guidance

- Source changes: prefer `npm run build` and `npx tsc --noEmit --incremental
  false`. `next lint` is not reliable for the current Next version here.
- Markdown-only Bugbot guide changes: `git diff --check` and confirm the diff is
  limited to `.cursor/BUGBOT.md`.
- Public asset or metadata changes: verify the referenced files exist and, for
  images, inspect dimensions/type.
- If verification rewrites generated Next route typings in `next-env.d.ts`,
  restore that file unless the PR intentionally changes Next generated typing
  behavior.

## Service enablement smoke check

After this file is merged to the default branch, confirm hosted Bugbot separately
by checking Cursor dashboard/org settings, GitHub App access to this repository,
or Admin API configuration. When a PR is available, run a manual `cursor review`
or `bugbot run` comment and verify Bugbot posts a review. If that cannot be
checked, state that only repository-side review guidance was deployed.
