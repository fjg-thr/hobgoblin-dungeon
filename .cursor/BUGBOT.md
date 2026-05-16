# Cursor Bugbot review instructions

This repository uses Cursor Bugbot for pull request review. Bugbot must be enabled
for the repository in the Cursor dashboard; this file supplies project-specific
review guidance once the integration is active on the default branch.

## Project context

- This is a Next.js app with a client-only Phaser dungeon prototype.
- The main React entry points are under `src/app` and `src/game/GameCanvas.tsx`.
- Most gameplay logic lives in `src/game/scenes/DungeonScene.ts`.
- Asset paths and frame metadata are centralized in `src/game/assets/manifest.ts`.
- Procedural map generation and tile semantics live in
  `src/game/maps/startingDungeon.ts`.
- Generated image/audio processing scripts live under `tools/` and `scripts/`.

## Review priorities

1. Flag browser/runtime issues in client-only code, especially changes that can
   instantiate Phaser on the server, create duplicate game instances, leak event
   listeners, or skip `destroy()` cleanup.
2. Check gameplay state changes for broken invariants: health and ammo bounds,
   projectile lifetimes, power-up timers, enemy respawn timing, invulnerability
   windows, score updates, and game-over transitions.
3. Check map, collision, and pathing edits for off-by-one errors, out-of-bounds
   access, unreachable player/enemy spawns, blocked pickups, or tile codes that
   are not handled consistently.
4. For asset changes, verify manifest keys, public asset paths, frame sizes,
   frames-per-row metadata, and animation row assumptions stay synchronized with
   the committed sprite-sheet JSON and PNG assets.
5. For generated or processed assets, make sure source and processed files remain
   intentionally paired and that scripts do not overwrite unrelated assets.
6. Keep TypeScript strictness intact. Prefer typed interfaces and narrow unions
   over `any`, unchecked casts, or stringly typed gameplay state.
7. For React/Next changes, preserve client/server boundaries and avoid importing
   Phaser into server components or module paths that run during SSR.
8. For UI overlays and controls, review keyboard and pointer accessibility,
   visible focus, `aria-*` labels, and avoiding pointer-only flows.
9. Call out changes that make tests or builds unreliable because of randomness,
   timers, global browser state, or generated file churn.

## Expected verification

- Prefer `npm run build` for end-to-end TypeScript and Next.js validation.
- If a PR only changes documentation or Bugbot configuration, a clean git diff
  review is sufficient.
- For gameplay changes that cannot be fully covered by the build, request manual
  browser verification of movement, combat, pickups, audio mute, restart, and
  game-over behavior.
