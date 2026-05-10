# Bugbot Review Guidelines

This project is a Next.js App Router prototype that hosts a Phaser game. Review code with gameplay correctness, browser runtime behavior, and asset consistency as the primary concerns.

## Review priorities

- Flag server/client boundary issues. Phaser and `window` access should stay behind client components, dynamic imports, effects, or other browser-only paths.
- Check generated dungeon invariants. Map rows should stay `MAP_WIDTH` by `MAP_HEIGHT`, player and enemy starts should be on playable tiles, and new tile codes must be handled by collision and asset lookup helpers.
- Watch Phaser lifecycle changes. Scene restarts, timers, tweens, input handlers, audio, and pooled objects should be cleaned up or reset without leaking across runs.
- Inspect update-loop performance. Avoid unbounded object creation, listener registration, or expensive searches inside per-frame paths unless there is an explicit cap.
- Validate asset manifest changes. Public asset paths, frame dimensions, metadata files, animation row assumptions, and sprite keys should remain synchronized with files under `public/assets`.
- Review gameplay balance changes for broken edge cases: safe spawn distance, ammo starvation, invulnerability windows, pickup caps, projectile lifetimes, game-over state, and pause/mute behavior.
- For UI or metadata edits, preserve accessibility and make sure social metadata uses valid absolute bases in deployed environments.

## Verification expectations

- Ask for `npm run build` evidence when TypeScript, Next.js metadata, asset imports, or game code changes.
- Ask for a browser smoke test when Phaser scene behavior, controls, audio, or visual assets change.
- Prefer actionable findings with file/line references and a concrete failure mode. Avoid style-only comments unless they point to a likely bug, regression, or maintainability risk.
