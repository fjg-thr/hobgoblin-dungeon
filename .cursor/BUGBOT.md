# Bugbot Review Instructions

This repository is a Next.js prototype for a Phaser-powered isometric dungeon game. Review code with a focus on correctness, runtime stability, and maintainability for browser gameplay.

## Project context

- App shell lives under `src/app`.
- The Phaser canvas bridge lives in `src/game/GameCanvas.tsx`.
- Core gameplay logic is concentrated in `src/game/scenes/DungeonScene.ts`.
- Tile/map data lives in `src/game/maps`.
- Asset references and manifests live under `src/game/assets` and `public/assets`.
- Asset generation/processing scripts live in `tools` and `scripts`.

## Review priorities

1. Flag changes that can break a production Next.js build, server/client component boundaries, or browser-only Phaser imports.
2. Check gameplay state transitions for regressions in spawning, pickups, damage, ammo, scoring, start/game-over screens, and restart behavior.
3. Watch for asset manifest mismatches: missing files, incorrect frame names, broken JSON dimensions, or public asset paths that do not match committed files.
4. Look for timing and lifecycle issues in Phaser scene code, especially event listeners, timers, tweens, input handlers, and object cleanup across restarts.
5. Call out changes that make the large scene harder to reason about without adding clear boundaries or tests.
6. Treat generated binary/media assets as secondary unless a code change depends on their names, dimensions, frame counts, or paths.

## Verification guidance

When reviewing a PR, prefer these checks when relevant:

```bash
npm run build
npx tsc --noEmit
```

If a change touches asset processing or generation scripts, also inspect the generated manifest diffs and verify that referenced files exist under `public/assets`.

## Comment style

- Prioritize high-confidence bugs, regressions, and missing verification.
- Include concrete file and line references whenever possible.
- Avoid broad style feedback unless it affects correctness, accessibility, performance, or maintainability.
