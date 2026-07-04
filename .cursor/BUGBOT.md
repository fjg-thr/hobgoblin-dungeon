# Cursor Bugbot Review Guide

Use this file as repository-specific context when reviewing pull requests for the
Hobgoblin Ruin prototype. Focus on defects that would regress the shipped web
prototype, break build/deploy behavior, or make future asset-heavy changes hard
to validate.

## Repository profile

- App: Next.js + React entry point that mounts a Phaser 4 dungeon scene.
- Main runtime scene: `src/game/scenes/DungeonScene.ts`.
- Asset source of truth: `src/game/assets/manifest.ts`.
- Public assets: `public/assets/**`.
- Asset/audio helper scripts: `tools/**` and `scripts/**`.
- Package manager files currently include both `package-lock.json` and
  `pnpm-lock.yaml`; dependency changes should keep the relevant lockfiles
  consistent.
- This repo does not configure Tailwind or shadcn/ui. Review UI changes against
  the existing React, CSS, and Phaser canvas patterns instead of assuming those
  tools are available.

## Review priorities

1. Call out runtime crashes, broken controls, failed builds, missing assets,
   broken audio loading, or regressions that stop a player from starting,
   moving, aiming, firing, taking damage, collecting pickups, muting audio, or
   restarting.
2. Call out reviewable gameplay bugs caused by changed constants, state reset
   logic, spawn timers, collision math, projectile lifecycle, power-up timers,
   or scene shutdown cleanup.
3. Call out deploy/build problems in Next.js config, metadata, TypeScript
   settings, lockfiles, static assets, and route/type generation.
4. Prefer high-signal findings. Do not block unrelated PRs solely for
   pre-existing README/code drift or already-known prototype limitations unless
   the PR makes them worse.

## Baseline verification

When a PR changes source, build, dependency, or asset loading behavior, expect at
least these checks to be considered:

```bash
npm install
npm run build
npx tsc --noEmit --incremental false
```

Notes:

- `next lint` is still listed in `package.json`, but modern Next versions may no
  longer provide that command reliably. Prefer build and TypeScript checks for
  actionable verification.
- `next dev` can rewrite `next-env.d.ts` to reference `.next/dev/types`, while a
  production build can rewrite it to `.next/types`. Treat unintended
  `next-env.d.ts` churn as generated noise unless the PR intentionally changes
  Next type generation behavior.
- For asset-only PRs, also verify that every path in `assetManifest` exists under
  `public/` and that changed sprite sheets match their JSON metadata and
  declared frame dimensions.
- For audio PRs, verify `assetManifest.audio` first. The
  `public/assets/audio/audio-manifest.json` file is useful for consistency checks
  but is not the runtime loader's source of truth.

## Manual smoke checks

For gameplay, input, UI overlay, audio, or canvas layout changes, ask for or
perform a manual browser smoke test when practical:

1. Run `npm run dev` and open `http://localhost:3000`.
2. Start a run from the title screen.
3. Move with `WASD` or arrow keys.
4. Aim with the pointer.
5. Fire with `Space`; click should aim and fire once.
6. Collect standard ammo, seeker ammo when unlocked, hearts when damaged, and
   visible power-ups.
7. Toggle the lower-right `SOUND` / `MUTED` control.
8. Trigger game over and confirm restart state resets timers, actors,
   projectiles, pickups, HUD text, audio state, and overlays cleanly.
9. Try a narrow/mobile viewport if the PR touches the start screen, how-to-play
   modal, HUD, or pointer hit zones.

README currently mentions `Space` or `J` for firing, but the current runtime
binds shooting to `Space` plus pointer/click firing. Treat that as an existing
documentation drift issue unless the PR changes controls or control copy.

## Gameplay invariants

When reviewing `DungeonScene.ts`, map changes back to these player-visible
behaviors:

- A new run must fully reset game state: health, ammo, seeker ammo, score, kill
  count, timers, active power-ups, projectiles, pickups, enemies, death sprites,
  camera/focus effects, debug overlays, and queued input.
- Movement, collision, and camera follow should preserve the isometric feel and
  avoid letting the player clip through blocking walls, props, enemies, or map
  bounds.
- Staff bolts consume finite ammo, travel in snapped aim directions, collide
  once, despawn reliably, and cannot damage dead or already-removed enemies.
- Seeker ammo is a code-defined progression feature: it unlocks after kill/time
  thresholds, uses separate ammo, homes within range, and should not be reviewed
  as a README-documented feature unless a PR also updates docs.
- Enemy pressure should ramp gradually without spawning enemies on top of the
  player, in blocked tiles, or outside reachable room/corridor space.
- Hearts restore missing hearts without increasing max health.
- Power-ups should remain progression-gated. Quickshot lowers fire cooldown,
  haste increases speed, ward blocks damage, and blast charges the next shot to
  detonate nearby enemies.
- Ward and player damage flows must avoid double damage, negative health, or
  invulnerability timers that never clear.
- Scene shutdown/restart must remove event listeners, timers, tweens, sounds, and
  Phaser objects created by the scene to avoid duplicate input or audio after a
  restart.

## Asset and audio review rules

- Keep `src/game/assets/manifest.ts` aligned with files in `public/assets/**`.
  A manifest path typo is a runtime load failure even if TypeScript passes.
- Preserve frame sizes, row counts, animation keys, and JSON metadata when
  replacing sprite sheets.
- If adding generated assets, include the source prompts or processing steps in
  the appropriate docs/scripts when that information is needed to regenerate the
  asset.
- Relevant generators and processors include:
  - `tools/process_assets.py`
  - `tools/process_corporate_goblin_assets.py`
  - `tools/process_spreadsheet_brute_assets.py`
  - `tools/generate_audio_sfx.mjs`
  - `scripts/generate-retro-soundtrack.mjs`
- Generated image changes should avoid antialiasing, unexpected transparency
  artifacts, or mismatched palette/scale for the GBA-inspired pixel style.
- Audio changes must respect the scene-level mute toggle and should avoid
  starting overlapping loops that survive restart or scene shutdown.

## Next.js, metadata, and DOM UI

- `src/app/page.tsx` should remain a small client/server boundary that mounts the
  game canvas without duplicating game state outside Phaser.
- `src/game/GameCanvas.tsx` should avoid importing Phaser on the server or
  touching browser-only APIs before client mount.
- Metadata changes in `src/app/layout.tsx` should keep referenced static files
  present under `public/`, with matching dimensions and useful alt text. If a PR
  changes share-image metadata or removes image assets, verify that
  `/opengraph-image.png` and related references are still valid.
- DOM/CSS changes should follow existing `src/app/globals.css` patterns. If
  clickable DOM controls are added outside the Phaser canvas, they should be
  keyboard-accessible and expose clear labels.
- Phaser UI controls are canvas objects, so review them for practical pointer hit
  zones, visible affordances, responsive placement, and keyboard/mouse parity
  where applicable.

## Documentation review

- README controls and gameplay descriptions should match runtime behavior when a
  PR intentionally changes those areas.
- Do not block unrelated PRs for these existing mismatches unless the PR touches
  the affected code/docs:
  - README mentions `J` firing, but runtime shooting currently uses `Space` and
    pointer/click firing.
  - README documents standard ammo, hearts, quickshot, haste, ward, and blast,
    but seeker ammo currently exists primarily in code.
  - README describes blast as rare late-game; actual unlock timing is controlled
    by `POWERUP_CONFIG`.
- Keep known limitations honest. If a PR claims a limitation is fixed, verify the
  implementation and README update together.

## Dependency and security hygiene

- Dependency PRs should update lockfiles consistently and keep Phaser pinned
  unless the PR explicitly upgrades and validates Phaser behavior.
- Review package changes for unnecessary transitive churn, duplicated package
  manager changes, or scripts that execute network or shell commands during
  install/build unexpectedly.
- Treat stale vulnerability audit output as dependency work, not as a blocker for
  unrelated scoped gameplay or Bugbot-guidance PRs unless the PR worsens it.

## Bugbot operation notes

- This file gives Bugbot repository context. It does not by itself prove that the
  managed Bugbot service is enabled.
- Managed enablement must be verified outside the repo through Cursor dashboard
  or organization settings, repository provider/GitHub App access, optional
  Admin API configuration, and a live pull-request trigger.
- After the repository is enabled, Bugbot can run automatically on PR creation or
  updates. Manual top-level PR comments can trigger review with:

```text
cursor review
bugbot run
```

- For troubleshooting, use verbose manual triggers such as
  `cursor review verbose=true` or `bugbot run verbose=true` and include the
  resulting request ID when escalating.
- Repository rule changes take effect after they land on the default branch.
  A PR that adds or changes this file may not be reviewed with the new guidance
  until after merge.
