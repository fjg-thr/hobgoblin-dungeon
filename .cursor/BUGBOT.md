# Cursor Bugbot review guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin prototype.
The repository-side part of this deployment is this file; managed Cursor Bugbot
enablement still depends on external Cursor dashboard or organization settings,
GitHub App repository access, Admin API credentials if used, and a live pull
request trigger check.

## Repository profile

- Next.js App Router shell with a client-only Phaser canvas.
- Main runtime code lives in `src/game/scenes/DungeonScene.ts`.
- Map generation and collision helpers live in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths are centralized in `src/game/assets/manifest.ts`.
- The app shell, metadata, and CSS are in `src/app/layout.tsx`,
  `src/app/page.tsx`, and `src/app/globals.css`.
- There are no automated tests or GitHub workflow files in this checkout.
- Both `package-lock.json` and `pnpm-lock.yaml` are tracked; prefer the package
  manager already used by the change under review, and call out lockfile drift.

## Review priorities

1. Protect gameplay behavior in `DungeonScene.ts`. It is a large file, so favor
   localized diffs and check every call site touched by a helper or constant.
2. Keep asset keys, public file paths, atlas JSON, generated frame sizes, and
   loader calls in sync. `src/game/assets/manifest.ts` is the runtime source of
   truth.
3. Treat README and in-game control copy as user-facing contracts. Flag changes
   that widen existing docs/runtime mismatches instead of silently accepting
   them.
4. Check canvas UI changes manually. Most start, help, mute, HUD, and game-over
   controls are Phaser objects rather than semantic DOM elements.
5. Keep build verification practical. There is no test runner, so compile gates
   plus focused manual gameplay checks matter.

## Verification commands

Run commands from the repository root.

```bash
npm install
npm run build
npx tsc --noEmit --incremental false
```

Notes:

- `npm run build` is the primary compile gate for Next.js and TypeScript.
- `npx tsc --noEmit --incremental false` is the explicit source type check.
- `npm run lint` exists in `package.json`, but `next lint` is unreliable with
  the installed Next 16 toolchain. Do not block a PR only because that command is
  unavailable or deprecated.
- If verification dirties generated Next files such as `next-env.d.ts`, restore
  them unless the PR intentionally changes Next generated typing behavior.
- For gameplay changes, also run `npm run dev`, open `http://localhost:3000`,
  and smoke-check the affected game loop.
- Binary assets may be generated outside this checkout. If runtime asset files
  are missing locally, state that limitation before claiming browser gameplay was
  fully verified.

## Manual gameplay smoke checks

Use these checks when a PR touches runtime game logic, assets, controls, HUD, or
Phaser scene lifecycle code:

- Start screen appears, the how-to-play panel opens and closes, and the game can
  start with `Space`.
- Movement works with `WASD` and arrow keys.
- Mouse aiming snaps shots to 15-degree angles.
- `Space` and pointer click fire; standard ammo is consumed and red staff-shard
  pickups restore ammo.
- Seeker ammo unlocks through progression, uses cyan seeker pickups, consumes
  before standard ammo, and homes toward enemies.
- Initial goblins are seeded from map enemy starts; additional goblins ramp with
  target enemy count, and brutes spawn only after their configured unlock gates.
- Contact damage, invulnerability, heart pickups, and ward behavior still match
  the current life-meter rules.
- Quickshot, haste, ward, and blast power-ups display feedback and expire or
  consume as designed.
- Blast charges the next shot; it is not an immediate area detonation on pickup.
- `F3` toggles collision boxes, player bounds, and tile coordinates.
- The lower-right `SOUND` / `MUTED` toggle updates audio state and persists the
  `hobgoblin-dungeon-muted` localStorage preference.
- Game-over UI shows a restart path and resets run state cleanly.

## Gameplay invariants

- `src/game/scenes/DungeonScene.ts` owns combat, input, HUD, audio, pickups,
  start/help/game-over UI, and scene reset behavior.
- Keep aim snapping, projectile lifetime, ammo accounting, and hit feedback in
  sync when touching firing logic.
- Seeker projectiles should keep their target-finding and steering behavior
  separate from standard staff bolts.
- `POWERUP_CONFIG` controls progression gates and duration/weight behavior for
  quickshot, haste, ward, and blast.
- Blast state is a charged-shot flag (`blastShotReady`) that applies radial
  damage on projectile impact.
- The staircase is intentionally visible but does not transition to another
  level.
- Collision uses simple tile and prop proximity checks, not a full physics
  system.
- `src/game/maps/startingDungeon.ts` should keep player spawn, enemy spawns,
  prop placement, room connectivity, and blocking tile semantics consistent.

## Asset and audio review rules

- `assetManifest.audio` in `src/game/assets/manifest.ts` is the runtime audio
  source of truth. `public/assets/audio/audio-manifest.json` is auxiliary and
  should stay consistent when audio keys or files change.
- Atlas or sprite-sheet changes must preserve frame sizes expected by
  `manifest.ts` and by animation frame indices in `DungeonScene.ts`.
- Metadata JSON under `public/assets/**` must match the generated image layout.
- Chroma-key conventions from `ASSET_PROMPTS.md` use bright green or magenta
  backgrounds and nearest-neighbor scaling for pixel art.
- `tools/generate_audio_sfx.mjs` generates procedural SFX.
- `scripts/generate-retro-soundtrack.mjs` generates
  `public/assets/audio/retro_dungeon_theme.wav`.
- `tools/process_corporate_goblin_assets.py` and
  `tools/process_spreadsheet_brute_assets.py` are direct Python asset processors.
- Several Node asset processors use `sharp`, and Python processors use Pillow,
  but those tool dependencies are not declared in `package.json`.
- Do not rely on hardcoded local absolute paths in asset tooling without making
  them configurable for this repo.

## Documentation consistency checks

Current code and docs have known drift. Do not block unrelated PRs solely for
pre-existing drift, but flag PRs that touch the relevant behavior or copy without
correcting the mismatch.

- README says `Space` or `J` fires; current runtime binds firing to `Space` and
  pointer click.
- README says blast is a rare late-game pickup that detonates nearby enemies;
  current runtime uses blast to charge the next explosive shot.
- README does not fully document seeker ammo even though the code exposes seeker
  pickups, seeker projectiles, and the HUD seeking-arrows indicator.
- README lists generated PNG and audio assets that may not all be present in the
  checkout.
- `src/app/layout.tsx` references `/opengraph-image.png`; verify the asset is
  present if metadata or public sharing files change.
- Keep in-game how-to-play copy consistent with runtime controls and README
  changes.

## UI, responsive layout, and accessibility

- This project does not use Tailwind or Shadcn. DOM styling is plain CSS in
  `src/app/globals.css`; most game UI is Phaser-rendered canvas content.
- The Phaser canvas has limited semantic accessibility by design. When PRs add
  DOM controls, require normal labels, keyboard access, and focus behavior.
- For canvas UI changes, review pointer hit zones, keyboard fallbacks, ESC
  behavior, responsive placement, and visual contrast.
- The start screen, how-to-play modal, mute toggle, HUD, and game-over panel are
  easy to regress because they share scene state with gameplay.
- The how-to-play modal has compact and tiny viewport branches; check small
  viewport layout if modal dimensions or text change.
- Do not confuse the visual focus vignette with browser keyboard focus.

## Dependency and project hygiene

- Dependencies use `latest` for Next, React, and TypeScript, while Phaser is
  pinned to a release candidate. Watch for lockfile-only changes caused by fresh
  installs.
- Keep dependency hardening separate from Bugbot guidance or gameplay changes
  unless the PR explicitly requests dependency work.
- If a PR changes package managers, require a clear migration and removal or
  regeneration of stale lockfiles.
- There is no `test` script today. If a PR adds tests or CI, make sure the
  commands are documented and can run from a clean checkout.

## Bugbot operation notes

- This file gives repository-specific guidance to Cursor Bugbot after it lands
  on the default branch.
- PRs that add or edit this file may not be reviewed using the new rules until
  after merge.
- To request a manual Bugbot pass on a GitHub PR, add a top-level comment such
  as `cursor review` or `bugbot run`.
- For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true` to request more diagnostic output, request IDs, and
  log detail.
- If Bugbot does not run, verify Cursor dashboard settings, org policy, GitHub
  App installation scope, repository access, and Admin API credentials where
  applicable.

## What to mention in review comments

- Cite exact files and functions when possible, especially inside
  `DungeonScene.ts`.
- Distinguish pre-existing limitations from regressions introduced by the PR.
- Prefer actionable review comments tied to gameplay invariants, build output,
  asset consistency, or user-facing docs.
- If local browser testing is incomplete because generated binary assets are
  unavailable, say so explicitly.
