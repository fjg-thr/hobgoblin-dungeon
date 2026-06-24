# Cursor Bugbot review guidance

Use this file as repository-specific context when Cursor Bugbot reviews pull
requests for Hobgoblin Ruin Prototype. It complements, but does not replace,
the hosted Bugbot setup in Cursor.

## Activation and scope

- Hosted Bugbot must be enabled in Cursor dashboard or organization settings,
  with the GitHub App granted access to `fjg-thr/hobgoblin-dungeon`.
- This file only gives review rules. It cannot prove that hosted Bugbot is
  enabled; confirm with dashboard settings, repository integration access, or a
  live PR smoke review after this file reaches the default branch.
- To manually request a review on a PR, leave a top-level comment containing
  `cursor review` or `bugbot run`. Use `cursor review verbose=true` or
  `bugbot run verbose=true` when diagnostics, logs, or a request ID are needed.
- Project rules apply after merge to the default branch. A PR that adds or edits
  this file may not itself be reviewed with the new instructions.

## Repository shape

- App shell: Next.js App Router under `src/app`.
- Client game mount: `src/game/GameCanvas.tsx`.
- Main gameplay scene: `src/game/scenes/DungeonScene.ts`.
- Map generation: `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`, especially
  `assetManifest.audio` for audio loaded by Phaser.
- Assets live under `public/assets/**`; generation and processing tools live in
  `tools/**` plus `scripts/generate-retro-soundtrack.mjs`.

## Review priorities

- Treat gameplay regressions as blocking when PRs touch movement, collision,
  camera follow, enemy spawning, combat, pickups, scoring, HUD, audio, or start
  and game-over flows.
- In `DungeonScene.ts`, look for lifecycle leaks, duplicate listeners/timers,
  stale Phaser objects, unmanaged tweens, scene restart issues, and state that
  survives a new run incorrectly.
- In `GameCanvas.tsx`, verify client-only Phaser imports stay behind the
  browser boundary and React cleanup destroys the game instance exactly once.
- For asset/audio PRs, ensure manifest keys, preload paths, generated JSON, and
  files under `public/assets/**` stay in sync. Runtime audio uses
  `assetManifest.audio`; `public/assets/audio/audio-manifest.json` is auxiliary
  consistency data.
- For UI/metadata changes, prefer semantic DOM and the existing
  `src/app/globals.css` patterns. Tailwind is not configured in this repo.
- For Phaser UI overlays, review pointer zones, keyboard and mouse affordances,
  responsive placement, and canvas-specific accessibility limits.
- Do not block unrelated PRs solely on existing baseline dependency advisories
  or documentation drift called out below; block changes that worsen them or
  claim to fix them without doing so.

## Known baseline caveats

- README says `Space` or `J` fires, while current runtime firing is centered on
  `Space` plus pointer/click behavior. Only treat this as blocking for input or
  controls documentation PRs.
- README documents regular ammo and several powerups but not seeker ammo.
  Current code unlocks seeker pickups/projectiles through progression.
- README describes blast as a rare late-game powerup, while current config can
  unlock it earlier. Treat this as existing drift unless the PR touches powerup
  progression or docs.
- `src/app/layout.tsx` references `/opengraph-image.png`, but the matching
  asset is absent on the baseline. Block only metadata/share-image changes that
  make this worse or pretend to resolve it.
- `npm ci` currently reports baseline audit advisories. Do not require an
  unrelated PR to solve them, but flag dependency changes that introduce new
  vulnerabilities or miss a clear safe upgrade.

## Verification expectations

Ask authors to run the narrowest relevant checks, and flag missing verification
when behavior changes lack evidence:

- `npm ci`
- `npm run build`
- `npx tsc --noEmit`
- Asset/tool changes as relevant:
  - `npm run process:assets`
  - `npm run process:death-assets`
  - `npm run process:combat-juice`
  - `npm run generate:powerups`
  - `npm run generate:combat-assets`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`

## Review style

- Lead with concrete bugs and user-visible regressions, with file and line
  references.
- Prefer actionable findings over style-only comments.
- Note residual risk when hosted Bugbot enablement cannot be verified from git.
