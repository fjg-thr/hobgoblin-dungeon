# Bugbot Review Instructions

Use these project-specific rules when reviewing pull requests for this repository.

## Review priorities

- Flag user-visible regressions in game feel, controls, rendering, audio playback, and HUD behavior.
- Check that Phaser scene changes clean up timers, event listeners, tweens, keyboard input, and game objects they create.
- Verify asset manifest changes stay in sync with files under `public/assets` and that frame names match the generated JSON.
- Treat TypeScript type errors, unreachable game states, and uncaught browser/runtime exceptions as blocking issues.
- Prefer focused fixes over broad refactors unless the refactor directly reduces risk in the changed code.

## Next.js and React expectations

- Keep React components client-safe when they interact with Phaser or browser-only APIs.
- Preserve the dynamic Phaser loading pattern so server-side rendering does not import browser-only game code.
- Use existing app structure and Tailwind/global styling conventions instead of introducing unrelated UI frameworks.

## Game implementation expectations

- Keep coordinate conversions, collision checks, depth sorting, and spawn logic deterministic and easy to reason about.
- Watch for stale state in long-lived Phaser scene fields, especially across restart/game-over flows.
- Ensure new controls remain keyboard accessible and do not interfere with existing `WASD`, arrow, click, `Space`, `J`, and `F3` controls.
- Keep performance-sensitive update-loop work bounded; avoid per-frame allocations or full-map scans unless the map size is explicitly constrained.

## Verification expectations

- For code changes, expect at least `npm run build` to pass before merge.
- If asset generation scripts are changed, verify the relevant script runs and that generated assets are intentionally updated.
- If gameplay behavior changes, prefer a short manual test note covering movement, firing, pickups, enemies, restart, and audio mute.
