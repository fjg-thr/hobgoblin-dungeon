# Cursor Bugbot review context

Use this file as the repository-specific context for Cursor Bugbot reviews.
The managed Bugbot service is enabled outside the repository through Cursor
dashboard/org settings and GitHub App repository access; this file only guides
the reviews that run after that service is enabled.

## Project map

- App: Next.js App Router with React and TypeScript under `src/app`.
- Runtime game shell: `src/game/GameCanvas.tsx` is a client component that
  dynamically imports Phaser and `DungeonScene` so Phaser does not load during
  server rendering.
- Main gameplay logic: `src/game/scenes/DungeonScene.ts` owns scene preload,
  animations, input, generated dungeon placement, collision checks, enemy AI,
  combat, pickups, power-ups, audio, HUD, start/game-over screens, and debug
  overlay behavior.
- Map constants and generation helpers live in `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth is `src/game/assets/manifest.ts`, including
  `assetManifest.audio`. Treat `public/assets/audio/audio-manifest.json` as an
  auxiliary consistency artifact if it is touched, not as the runtime loader.
- Offline asset/audio generator and processor scripts live in `tools/` and
  `scripts/`. These are not production runtime paths unless a PR wires them into
  the app.
- Static images, sprite metadata, and audio files live under `public/assets`.

## Review priorities

Prioritize concrete defects over broad style feedback:

1. Regressions in gameplay state, collision, combat, enemy spawning, projectile
   lifetimes, pickup collection, power-up timers, scoring, health, ammo, or
   game-over/restart flow.
2. React/Next lifecycle bugs, especially changes that could load Phaser during
   SSR, leak Phaser game instances, or break cleanup in `GameCanvas`.
3. Asset manifest mismatches: missing files referenced from `assetManifest`,
   stale frame dimensions, wrong sprite keys, or audio keys that no longer match
   scene usage.
4. Input regressions for keyboard, pointer aiming/click firing, mute toggle,
   start/how-to-play/restart controls, and debug overlay behavior.
5. TypeScript issues, unreachable branches, stale constants, accidental global
   state, unbounded timers/tweens, or collections that are not cleaned up when
   scene state resets.

## Existing behavior and known mismatches

- README controls currently mention `Space` or `J` for firing. The runtime
  keyboard binding uses `Space`, and pointer/click can aim and fire. Do not block
  unrelated PRs solely on the existing `J` mismatch; flag it when a PR changes
  controls or documentation.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and
  blast. The code also defines seeker ammo/projectiles that unlock through
  runtime progression. Treat seeker behavior as code-defined unless a PR
  intentionally updates player-facing docs.
- README describes blast as rare late-game, while current code unlocks blast
  earlier through `POWERUP_CONFIG.blast`. Treat this as an existing docs/code
  mismatch unless a PR is specifically changing power-up progression.
- There is no automated test suite in this repository. Missing tests are useful
  suggestions for risky gameplay changes, but should not be the only blocking
  review finding for a scoped documentation, asset, or configuration change.

## Style and implementation guidance

- Keep TypeScript strict and prefer small, typed helpers when they make gameplay
  rules clearer. Avoid broad rewrites of `DungeonScene.ts` unless the PR is
  intentionally restructuring scene responsibilities.
- This project currently uses plain CSS in `src/app/globals.css`, not Tailwind or
  shadcn/ui. Review styling changes against existing semantic elements and CSS
  patterns.
- Do not suggest new dependencies for simple Phaser, React, or asset-manifest
  changes unless they remove a real maintenance burden.
- Be cautious with generated assets and lockfiles. A gameplay PR should not
  rewrite unrelated sprite sheets, audio files, or dependency lockfiles.
- For package commands, README documents npm usage. Both npm and pnpm lockfiles
  may exist on branches; avoid dependency churn unless the PR is explicitly about
  package management or CI.

## Manual verification checklist

For meaningful app/runtime changes, ask for or run the narrowest relevant checks:

- `npm ci`
- `npm run build`
- `npx tsc --noEmit`
- Browser smoke test: open the game, start a run, move with WASD/arrows, aim with
  the pointer, fire with Space/click, collect ammo/heart/power-ups, toggle sound,
  trigger game over, restart, and toggle the debug overlay with F3.
- Asset changes: confirm every manifest path exists and matching JSON metadata
  still agrees with frame dimensions and animation ranges.

For documentation-only Bugbot guidance updates, run a whitespace diff check and
file existence/content validation. A full app build/typecheck is still useful
before opening the deployment PR.

## Managed Bugbot deployment boundaries

Repository files cannot prove that Cursor Bugbot is enabled. A complete
deployment still needs:

1. Cursor dashboard/org Bugbot settings enabled for this repository.
2. Cursor GitHub App installed with access to `fjg-thr/hobgoblin-dungeon`.
3. A PR smoke check where Bugbot reviews automatically or responds to
   `bugbot run` / `cursor review`.

If any of those external checks are unavailable, report that this repository has
only the review guidance needed for Bugbot once the managed service is enabled.
