# Cursor Bugbot review guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin prototype.
It adds repository-specific review context; it does not by itself enable the
managed Cursor Bugbot service. Service enablement still depends on Cursor
dashboard or organization settings, GitHub App repository access, Admin API
credentials when used, and live PR trigger checks.

## How to trigger a review

- On a GitHub pull request, add a top-level comment containing `cursor review`
  or `bugbot run`.
- For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true` to request more diagnostic detail such as request
  IDs and logs.
- Repository guidance is read from the default branch after this file is
  merged. A PR that adds or edits this file may not be reviewed with its new
  instructions until after merge.

## Project shape

- Stack: Next.js App Router, React, TypeScript, and Phaser 4.0.0-rc.4.
- Runtime: a thin Next shell renders a client-only Phaser canvas. Most gameplay
  behavior lives in `src/game/scenes/DungeonScene.ts`.
- Assets: sprite sheets, audio, generated sources, and metadata live under
  `public/assets`; generation and processing scripts live under `tools/` and
  `scripts/`.
- Tests: no dedicated test runner or CI workflow exists today. Treat build,
  typecheck, asset verification, and manual browser smoke checks as the main
  evidence until tests are added.

## Important files

- `src/app/page.tsx`: page entry that mounts `GameCanvas`.
- `src/app/layout.tsx`: metadata, OpenGraph, Twitter image configuration, and
  root HTML shell.
- `src/app/globals.css`: global page and canvas styling.
- `src/game/GameCanvas.tsx`: client-only Phaser boot, dynamic imports, resize
  behavior, and teardown.
- `src/game/scenes/DungeonScene.ts`: core scene, preload/create/update loops,
  combat, AI, pickups, HUD, audio, title/game-over screens, and debug overlay.
- `src/game/maps/startingDungeon.ts`: procedural dungeon generation, collision
  helpers, and isometric constants.
- `src/game/assets/manifest.ts`: runtime source of truth for Phaser asset keys,
  public paths, frame sizes, and audio paths.
- `public/assets/**`: runtime PNG/WAV assets plus JSON metadata generated from
  asset tooling.
- `tools/**` and `scripts/generate-retro-soundtrack.mjs`: asset and audio
  generation or post-processing tools.
- `README.md` and `ASSET_PROMPTS.md`: user-facing controls, known limitations,
  asset inventory, and generation prompts.

## Verification guidance

Request or run the narrowest checks that match the changed files:

```bash
npm run build
npx tsc --noEmit --incremental false
```

Notes:

- `npm run lint` currently maps to `next lint`. It is useful if the installed
  Next version supports it, but do not treat it as the only reliable gate for
  this project. Prefer `npm run build` plus the explicit `tsc` command above.
- If verification rewrites generated Next files such as `next-env.d.ts`, make
  sure the PR does not keep unrelated generated churn.
- Both `package-lock.json` and `pnpm-lock.yaml` are tracked, while README run
  instructions use npm. Dependency PRs should keep lockfiles intentional and
  explain any package-manager change.

For asset or audio changes, also verify the affected generation path:

```bash
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
```

Use only the commands relevant to the changed assets. Some Python tooling
requires Python 3 and Pillow, which are not declared in `package.json`.

For gameplay changes, ask for a browser smoke check when automated evidence is
insufficient:

- Start screen opens and the game can start.
- WASD or arrow movement works in isometric directions.
- Pointer aim and click firing work; SPACE firing works.
- Ammo pickup, power-up pickup, enemy contact damage, hearts, mute toggle, and
  game-over/restart still function when touched by the PR.
- The F3 debug overlay still toggles collision and tile information when debug
  behavior is touched.
- Resize behavior remains playable on compact and desktop viewports.

## High-priority review areas

### Next and React boundary

- Phaser, `window`, `document`, and `localStorage` must stay behind client-only
  boundaries. Do not import Phaser scene code directly into server components.
- `GameCanvas` should destroy Phaser game instances, event handlers, timers,
  and dynamic resources when unmounted or rebuilt.
- Metadata changes in `src/app/layout.tsx` should keep referenced public assets,
  dimensions, and alt text consistent. `/opengraph-image.png` is the current
  share image path.

### Phaser lifecycle and performance

- New scene listeners, input handlers, resize handlers, timers, tweens, and
  pooled objects need cleanup in the same lifecycle path that creates them.
- Avoid unbounded creation of text, sprites, particles, or audio objects inside
  `update`; prefer existing pools and capped effect helpers.
- Phaser 4.0.0-rc.4 can differ from Phaser 3 examples. Check API assumptions
  carefully before accepting copied Phaser 3 patterns.

### Gameplay behavior

- Treat `DungeonScene.ts` as high risk because it is large and tightly coupled.
  Review changed hunks for state transitions, timer interactions, object pool
  reuse, invulnerability windows, hit-stop, enemy caps, and spawn economy.
- Isometric math is fragile. Changes around world/tile conversion, collision,
  movement vectors, pointer aim, projectile velocity, or 15-degree aim snapping
  need focused scrutiny.
- Keep README-documented behavior consistent when a PR touches controls,
  pickups, power-ups, scoring, audio, or debug controls.
- Existing context: README mentions `Space` or `J` for firing, while the current
  in-game instruction copy emphasizes click or SPACE. Do not block unrelated PRs
  solely for that existing mismatch, but flag changes that make control copy
  less accurate.
- Existing context: seeker ammo behavior exists in code but is not fully
  described in README. Flag PRs that change seeker ammo without updating player
  docs or in-game copy when appropriate.

### Assets and manifests

- `src/game/assets/manifest.ts` is the runtime source of truth. Phaser preloads
  the PNG/WAV paths from that file; JSON `metadataPath` values document generated
  frame maps but are not the runtime source for most animations.
- When a PR changes sprite dimensions, frame counts, row ordering, or animation
  names, check the manifest, JSON metadata, PNG sheet, and animation code
  together.
- Asset PRs should include the actual binary assets when runtime paths change.
  Do not accept metadata-only changes that point to missing PNG/WAV files.
- Audio additions should update `assetManifest.audio` and any auxiliary
  `public/assets/audio/audio-manifest.json` entries together when both are
  relevant.

### Accessibility and UI

- DOM-level UI should use semantic HTML and maintain keyboard and screen-reader
  affordances.
- Phaser-rendered UI cannot rely on DOM semantics, so review it for pointer hit
  zones, keyboard alternatives, readable contrast, responsive placement, and
  accurate instruction copy.
- Start, how-to-play, HUD, mute, and game-over overlays should remain usable on
  compact screens.

## What not to flag as a bug by itself

- README-known prototype limitations: simple tile/proximity collision, visible
  but nonfunctional staircase, fresh dungeon per run, first-pass generated art,
  and first-pass procedural audio.
- The existence of a large `DungeonScene.ts` file unless the PR worsens the
  risk, expands unrelated responsibilities, or makes changed behavior harder to
  verify.
- Missing automated tests for unrelated gameplay changes, because the project
  currently has no test harness. Prefer asking for build/typecheck evidence and
  targeted smoke-test notes.
- Cosmetic rewrites or broad refactors that are not necessary for the PR's
  stated behavior.

## Review output expectations

- Lead with concrete behavioral risks, regressions, missing verification, or
  broken assets. Include file and line references.
- Distinguish pre-existing limitations from new regressions introduced by the
  PR.
- Prefer actionable findings over style nits, especially in generated assets,
  generated metadata, and the monolithic Phaser scene.
- If managed Bugbot enablement is the subject of a PR, state clearly whether the
  evidence is repository guidance only or includes external service verification.
