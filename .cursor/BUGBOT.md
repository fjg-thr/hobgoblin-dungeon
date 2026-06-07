# Bugbot review guidance

Use this guidance when reviewing pull requests for this repository.

## Project context

- This is a Next.js app that mounts a Phaser-based browser game from `src/game`.
- Most gameplay behavior lives in `src/game/scenes/DungeonScene.ts`; treat changes there as high risk because it owns enemy spawning, combat, pickups, UI overlays, collision, audio, and scene lifecycle behavior.
- Generated and processed game assets are stored under `public/assets` and referenced from TypeScript manifests and Phaser preload logic.

## Review priorities

Flag issues as blocking when a change can cause any of the following:

- Server-side rendering crashes from unguarded `window`, `document`, `AudioContext`, Phaser, or browser-only APIs outside client-only components or runtime guards.
- Phaser scene lifecycle leaks, including timers, tweens, event listeners, keyboard/mouse handlers, audio nodes, or DOM callbacks that are not cleaned up on scene shutdown or restart.
- Runtime asset failures, including references to missing files, mismatched sprite-sheet frame sizes, stale JSON metadata, incorrect public paths, or manifest entries that are not loaded before use.
- Gameplay invariants breaking, such as max health/ammo limits, invulnerability windows, pickup progression gates, enemy spawn caps, collision boundaries, restart flow, or game-over state transitions.
- Input regressions that break keyboard, mouse, touch/click firing, mute toggling, start/how-to-play controls, or debug overlay shortcuts.
- Performance regressions inside frame/update loops, especially new allocations, unbounded object creation, expensive searches, or work that scales with every tile/enemy/projectile each frame.

## Next.js and React checks

- Keep the Phaser canvas mounted from a client component; do not import Phaser from server components or layouts.
- Dynamic imports should preserve browser-only execution for the game runtime.
- Verify React effects that create game instances have deterministic cleanup and do not create duplicate Phaser games during rerenders.
- Avoid introducing custom CSS unless it is clearly necessary; prefer existing Tailwind/global styling patterns already used by the app.

## Testing expectations

For code changes, expect at least:

- `npm run build` for Next.js and TypeScript validation.
- A local browser smoke test of the game when gameplay, rendering, input, UI, or assets change.
- Asset-generation scripts only when their generated outputs or source assets changed.

If a PR cannot run these checks, call that out explicitly and review the changed paths for the same failure modes manually.
