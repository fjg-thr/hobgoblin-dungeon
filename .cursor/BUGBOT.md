# Bugbot review instructions

Review this repository as a Next.js + Phaser browser game prototype. Prioritize issues that can break gameplay, rendering, input handling, audio, build output, or asset loading.

## High-priority review areas

- **Phaser scene lifecycle:** Flag leaks or duplicated listeners, timers, tweens, sounds, textures, graphics, or input handlers across scene restart, shutdown, and game-over/start transitions.
- **Gameplay regressions:** Check movement, aiming, shooting, enemy spawning, collision, pickups, scoring, health, ammo, power-ups, mute state, debug overlay, and restart behavior for unintended changes.
- **Asset loading:** Verify manifest keys and file paths line up with files under `public/assets`. Report missing assets, mismatched frame sizes, invalid JSON metadata, or changes that would cause runtime preload failures.
- **React/Next boundaries:** Flag code that touches browser-only APIs during server render, breaks the client-only Phaser canvas setup, or introduces hydration/build problems.
- **TypeScript safety:** Prefer concrete types and narrow checks where the game loop depends on object state. Report unchecked optional scene objects when they can be absent during transitions.
- **Performance-sensitive loops:** Review `update`-path changes for avoidable allocation, expensive searches, or unbounded object growth that can affect frame rate.

## Lower-priority / expected patterns

- Many files in `public/assets` are generated sprite sheets, audio, or metadata. Do not nitpick generated art quality unless metadata/file consistency is broken.
- The prototype intentionally uses simple collision and combat systems. Do not require full physics, networking, persistence, or multi-level architecture unless the changed code claims to add it.
- Keep suggestions scoped to the changed behavior. Avoid broad refactors of the large Phaser scene unless a reviewed change makes the existing issue worse or unsafe.

## Verification expectations

- For code changes, expect at least a TypeScript/build-oriented check when toolchain support is available.
- For asset or manifest changes, expect a targeted consistency check that referenced files exist and JSON can parse.
- For gameplay changes, ask for a short manual smoke-test note covering start, movement, combat, pickup collection, mute toggle, death/game-over, and restart.
