# Cursor Bugbot Review Guide

This file gives Cursor Bugbot repository-specific context for reviewing changes in
`fjg-thr/hobgoblin-dungeon`. It does not enable the managed Bugbot service by
itself. Managed review behavior still depends on Cursor dashboard settings,
GitHub App repository access, and a PR smoke check that confirms Bugbot comments
or manual triggers are working.

## Managed service checks

- Confirm the Cursor dashboard or organization settings have Bugbot enabled for
  this repository.
- Confirm the Cursor GitHub App has access to this repository and permission to
  read pull request diffs and post review comments.
- On a pull request, Bugbot can be manually invoked with a top-level comment:
  `cursor review` or `bugbot run`.
- For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true`.
- If those external checks are unavailable, review the repository changes using
  this guide and state that managed Bugbot enablement was not directly verified.

## Project overview

- This is a Next.js app shell for a browser game prototype.
- `src/app/page.tsx` renders the game page.
- `src/game/GameCanvas.tsx` is a React client component that dynamically imports
  Phaser and mounts a single `DungeonScene`.
- `src/game/scenes/DungeonScene.ts` contains most gameplay, UI, input, audio,
  enemy, projectile, pickup, power-up, and scene lifecycle behavior. Treat
  changes here as high risk because it is large and stateful.
- `src/game/maps/startingDungeon.ts` defines room, corridor, tile, prop, and
  collision map data used by the scene.
- `src/game/assets/manifest.ts` is the runtime source of truth for loaded image,
  sprite sheet, UI, projectile, pickup, power-up, and audio paths.
- `public/assets/**` stores Phaser-loaded runtime assets and sprite metadata.
- `tools/**` and `scripts/**` contain local asset/audio generation and processing
  utilities. They are tooling, not generated runtime output.

## Review priorities

1. Gameplay correctness:
   - Check movement, aiming, firing, enemy AI, collisions, damage, invulnerability,
     pickup collection, score, ammo, power-up state, game-over, restart, and debug
     overlays for regressions.
   - Pay close attention to timers, delayed calls, tween cleanup, event listeners,
     object lifetimes, and state reset paths in `DungeonScene`.
   - Verify new mechanics interact correctly with existing quickshot, haste, ward,
     blast, hearts, ammo, seeker ammo, brutes, and goblins.

2. Phaser and React lifecycle:
   - `GameCanvas` should create one Phaser game per mounted host and destroy it on
     unmount.
   - Scene changes should clean up Phaser objects, keyboard/pointer handlers,
     timers, tweens, sounds, and groups when restarting or shutting down.
   - Avoid browser-only globals in server components. Keep Phaser imports inside
     client-only paths or dynamic imports.

3. Assets and manifests:
   - Any new runtime asset path must be present in `public/assets/**` and wired
     through `src/game/assets/manifest.ts` if the scene loads it.
   - Sprite sheet JSON frame names, frame sizes, row/column assumptions, and
     animation frame ranges must match the PNG files and loader code.
   - Audio used at runtime should be listed in `assetManifest.audio`; the
     auxiliary `public/assets/audio/audio-manifest.json` is not the runtime source
     of truth.
   - Do not commit large generated source images, build artifacts, or temporary
     processing output unless the PR intentionally updates assets.

4. TypeScript and Next.js health:
   - Prefer strong local types and narrow unions for gameplay state instead of
     broad strings or untyped maps.
   - Keep React components small and client/server boundaries explicit.
   - `next lint` is not reliable with the current Next version, so do not require
     it as the only gate.
   - `npm run build` and `npx tsc --noEmit` are the preferred verification checks.

5. User-facing UI, controls, and audio:
   - Confirm visible control text, README instructions, start screen, how-to-play
     overlay, sound/mute button, HUD, life meter, ammo UI, score, and game-over
     text stay consistent with runtime behavior.
   - Interactive UI areas should remain keyboard/pointer accessible where the game
     exposes DOM or Phaser input affordances.
   - Preserve the pixel-art presentation: nearest-neighbor scaling, low-resolution
     sprites, and existing plain CSS patterns in `src/app/globals.css`. This repo
     does not currently configure Tailwind.

6. Repository hygiene:
   - Keep diffs scoped. Do not introduce dependency, lockfile, CI, or generated
     asset churn unless it is part of the requested change.
   - Build/typecheck can rewrite `next-env.d.ts` and create `tsconfig.tsbuildinfo`;
     restore or remove those artifacts unless the PR intentionally changes them.
   - Use `git diff --check origin/main...HEAD` or the actual PR base branch to
     catch whitespace issues before review completion.

## Known baseline notes

- README says `Space` or `J` fires the staff bolt, but current runtime behavior is
  `Space` plus pointer/click firing. Flag this only when a PR changes controls,
  input docs, or related UI text; do not block unrelated PRs solely for this
  existing mismatch.
- Current code includes seeker ammo unlock/pickup/projectile behavior that is not
  fully described in README. Review code changes against existing runtime behavior
  and ask for docs only when the PR changes player-facing ammo mechanics.
- README describes blast as a rare late-game power-up, while current code unlocks
  blast earlier through `POWERUP_CONFIG.blast`. Treat this as known baseline drift
  unless a PR intentionally updates power-up progression or docs.
- `DungeonScene.ts` is large. Prefer targeted fixes and tests over broad rewrites
  unless the PR is explicitly a scene decomposition.

## Suggested validation commands

Run the smallest relevant subset for the PR, and prefer the full set when changes
touch gameplay, assets, dependencies, or build configuration:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check origin/main...HEAD
```

If verification changes generated files such as `next-env.d.ts` or
`tsconfig.tsbuildinfo`, clean them before finalizing the review unless those files
are intentionally part of the PR.
