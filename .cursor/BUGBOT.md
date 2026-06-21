# Cursor Bugbot Review Guide

Review this repository as a Next.js + Phaser browser game prototype. Prioritize user-visible bugs, runtime crashes, broken assets, gameplay regressions, and missing verification over style-only comments.

## Project-specific review priorities

- **Phaser scene safety:** Check lifecycle changes for duplicate event listeners, timers, tweens, unresolved async work, leaked game objects, and state that persists incorrectly between restarts.
- **Gameplay invariants:** Flag changes that can break movement, collision, aiming, ammo, health, scoring, enemy spawning, power-up timing, pickups, scene transitions, or game-over/restart behavior.
- **Asset consistency:** Verify that asset manifest keys, JSON frame names, generated sprite sheets, audio manifest entries, and public asset paths stay in sync. Flag references to files or frames that are not present.
- **Next.js boundaries:** Ensure Phaser/browser-only code stays client-side and does not access `window`, `document`, canvas APIs, or audio APIs during server rendering.
- **TypeScript correctness:** Prefer concrete types and narrow state transitions. Flag unchecked nullable values, unsafe casts, and broad `any` usage when they can hide gameplay/runtime failures.
- **Input and accessibility:** For UI controls outside the canvas, check keyboard access, labels, focus behavior, and pointer/touch handling.
- **Performance-sensitive loops:** Review per-frame updates for avoidable allocations, unbounded iteration, or work that scales unexpectedly with enemies, projectiles, particles, or map size.
- **Verification:** Expect relevant commands such as `npm run build` or `npx tsc --noEmit` for code changes, plus targeted manual gameplay notes when visual/gameplay behavior changes.

## Review tone

Report actionable findings with file/line references and explain the likely player or maintainer impact. Avoid blocking comments for unrelated refactors, formatting-only preferences, or speculative architecture changes that do not affect this pull request.
