# Bugbot review rules

This repository is a first-playable Next.js + Phaser web game prototype. Review PRs for concrete bugs, regressions, broken assets, and deployment risks. Prefer inline comments only when the changed code is likely to fail at runtime, fail the build, or regress documented gameplay.

## Project context

- The app is a single Next.js page that mounts a browser-only Phaser game through `src/game/GameCanvas.tsx`.
- The main gameplay logic lives in `src/game/scenes/DungeonScene.ts`; it depends on generated map data, Phaser lifecycle methods, sprite sheets, audio assets, keyboard/mouse input, and viewport resize behavior.
- Static assets are loaded from `public/assets/**` through `src/game/assets/manifest.ts`. Asset paths, frame sizes, metadata JSON, and Phaser animation keys must stay in sync.
- Map generation and tile collision live in `src/game/maps/startingDungeon.ts`. Tile code changes can affect movement, enemy spawning, prop placement, collision, and rendering.
- Asset generation scripts in `tools/**` and `scripts/**` should remain deterministic enough to regenerate documented assets without corrupting existing manifests.

## Flag as high priority

- Browser/server boundary mistakes: importing Phaser or touching `window`, `document`, canvas, audio, or input APIs from server components or module top level in files that can execute during Next.js SSR.
- Phaser lifecycle leaks: creating more than one `Phaser.Game`, failing to destroy scenes/game objects/timers/event listeners on unmount or scene shutdown, or registering duplicate keyboard, pointer, resize, animation, sound, or timer handlers across restarts.
- Broken asset references: manifest entries, sprite frame dimensions, metadata filenames, animation keys, or public paths that do not match committed files under `public/assets/**`.
- Gameplay state regressions: changes that make player movement, aiming, firing, ammo, health, power-ups, enemy spawning, collision, score, mute state, start screen, or game-over restart inconsistent with the README controls and limitations.
- Coordinate-space bugs: mixing tile, world, screen, camera, or isometric coordinates without conversion, especially for collision, pointer aim, projectile paths, enemy distance checks, pickups, and debug overlays.
- Map generation failures: generated maps without a reachable player start, enemy starts inside blocked tiles, stairs or pickups placed on blocked/chasm tiles, props blocking required paths, or rows whose lengths diverge from `MAP_WIDTH`.
- Audio/autoplay problems: starting audio before user interaction, ignoring mute state, or leaking looping ambience/theme sounds across restarts.
- Build or type failures: changes that would break `npm run build`, TypeScript strict mode, Next metadata handling, or client/server component boundaries.

## Review expectations

- If a PR changes gameplay logic, expect either focused automated coverage for extracted pure logic or a clear manual test note that exercises the changed behavior in the browser.
- If a PR changes assets or manifests, verify that every added manifest path has a corresponding committed asset and that sprite sheet frame sizes match the referenced metadata.
- If a PR changes dependency or lock files, look for mismatched package manager updates and dependency choices that are unnecessary for a game prototype.
- Keep comments specific and actionable. Include the failing scenario or likely runtime symptom; avoid style-only feedback unless it hides a real bug.

## Do not flag

- First-pass pixel art, generated asset aesthetics, or intentionally simple combat/collision limitations already documented in `README.md`.
- Lack of broad test infrastructure by itself. Only flag missing tests when the changed behavior is risky and lacks another credible verification path.
- Large existing size of `DungeonScene.ts` unless the PR makes the touched behavior harder to reason about or introduces a concrete regression risk.
