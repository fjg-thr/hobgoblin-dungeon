# Cursor Bugbot Review Instructions

Review pull requests in this repository as a strict TypeScript, Next.js, and Phaser game reviewer.

## Project context

- This is a Next.js app that boots a browser-only Phaser game from `src/game/GameCanvas.tsx`.
- Core gameplay, scene lifecycle, collision, input, spawning, scoring, and HUD behavior live in `src/game/scenes/DungeonScene.ts`.
- Asset definitions live in `src/game/assets/manifest.ts`; runtime files are served from `public/assets`.
- The project uses strict TypeScript and path aliases from `tsconfig.json`.

## Review priorities

1. Flag runtime crashes, stale event listeners, leaked timers, or Phaser objects that survive scene/game teardown.
2. Check browser-only APIs, dynamic Phaser imports, and client/server component boundaries for Next.js compatibility.
3. Verify asset manifest keys, frame dimensions, metadata paths, and public file paths stay in sync.
4. Look for gameplay regressions in movement, collision, enemy spawning, pickups, combat, scoring, audio, and pause/game-over flows.
5. Call out TypeScript type holes, unsafe casts, unhandled nullable values, or logic that bypasses strict-mode guarantees.
6. Identify costly per-frame allocations or work inside Phaser `update` paths that could affect browser performance.

## Validation expectations

- Prefer issues with concrete reproduction paths or specific code references.
- When reviewing code changes, confirm that relevant checks include `npm run build`.
- Treat generated assets and large binary/image outputs as low-signal unless they are referenced by code or manifest changes.
