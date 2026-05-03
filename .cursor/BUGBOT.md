# Bugbot Review Guidance

This repository is a Next.js App Router prototype that embeds a Phaser dungeon
game. Review changes with the following project context in mind.

## Runtime boundaries

- Keep browser-only Phaser code behind client components or dynamic imports. Do
  not import Phaser scenes from server components unless the import remains
  runtime-safe for server rendering.
- `src/game/GameCanvas.tsx` owns Phaser boot and teardown. New game objects,
  timers, tweens, input handlers, and audio nodes should be cleaned up when the
  scene or React component is destroyed.
- Preserve TypeScript strictness. Avoid `any` unless the Phaser API requires an
  escape hatch and the unsafe boundary is narrow.

## Gameplay and asset invariants

- Asset keys in `src/game/assets/manifest.ts`, JSON sprite sheets, and scene
  preload/animation code must stay in sync. Flag missing frames, renamed keys,
  or public asset paths that would fail at runtime.
- Dungeon collision and coordinate math use isometric tile coordinates. Be
  cautious with changes that mix screen pixels, world pixels, and tile points.
- Combat, pickup, power-up, and enemy spawning changes should preserve existing
  progression gates and avoid unbounded object growth over long play sessions.

## Review priorities

- Prioritize runtime crashes, memory leaks, stale event listeners, broken asset
  references, SSR/client-boundary mistakes, and TypeScript type regressions.
- Prefer small, focused fixes that match the current code style over broad
  refactors. Large scene-file refactors should be justified by clear behavior or
  maintainability wins.
- If a change adds player-facing behavior, look for an accompanying verification
  path: a focused automated check where practical, or clear manual playtest
  steps when the behavior depends on Phaser runtime interaction.
