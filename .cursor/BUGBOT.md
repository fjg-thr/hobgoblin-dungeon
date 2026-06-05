# Cursor Bugbot review rules

This repository is a Next.js application that boots a Phaser-based, pixel-art dungeon prototype from a client-only React component. Review pull requests for user-visible gameplay regressions as well as ordinary TypeScript and React issues.

## Project context

- `src/app/page.tsx` renders the game shell, and `src/game/GameCanvas.tsx` dynamically imports Phaser and `DungeonScene` to avoid server-side Phaser usage.
- `src/game/scenes/DungeonScene.ts` owns most gameplay state: map rendering, input, combat, pickups, audio, HUD, start/how-to-play/game-over overlays, and debug tools.
- `src/game/maps/startingDungeon.ts` defines procedural map generation and tile collision helpers.
- `src/game/assets/manifest.ts` is the source of truth for runtime asset keys and public asset paths.
- Sprite sheets, metadata JSON, audio, and generated art under `public/assets` must stay aligned with the manifest and processor scripts in `tools/`.

## Review priorities

- Flag any Phaser imports or browser-only APIs that can run during Next.js server rendering. Phaser should remain behind client-only code paths.
- Check gameplay changes for state lifecycle bugs: stale timers, pooled objects not reset, duplicate listeners, leaked tweens, audio continuing after scene shutdown, or state not reset between runs.
- Treat collision, tile coordinates, depth ordering, and camera math as high-risk. Verify changes preserve isometric coordinate conversions and blocked-tile checks.
- When asset manifests, sprite sheet metadata, or generated assets change, confirm dimensions, frame counts, keys, and public paths remain consistent.
- For controls, menus, HUD, mute, and modal interactions, check keyboard and pointer behavior together. Preserve documented controls from `README.md`.
- Require strict TypeScript-compatible code with descriptive names and early returns where they improve readability.
- Avoid broad rewrites of `DungeonScene.ts` unless they are directly tied to the requested behavior and include focused verification.

## Testing expectations

- For gameplay, input, rendering, or UI changes, ask for a local manual run of `npm run dev` and evidence that the changed flow works in the browser.
- For TypeScript, metadata, or configuration-only changes, `npm run build` is the minimum useful verification.
- If dependency files change, verify installation and build with the package manager reflected by the changed lockfile.
