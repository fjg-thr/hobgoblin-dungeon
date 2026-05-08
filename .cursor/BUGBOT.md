# Cursor Bugbot review guidance

Review this repository as a first-playable Next.js App Router and Phaser dungeon prototype. Prioritize behavioral regressions in gameplay, asset loading, scene lifecycle, and deployment safety over broad style feedback.

## Repository shape

- `src/app/page.tsx` renders a client-only `GameCanvas`.
- `src/game/GameCanvas.tsx` dynamically imports Phaser and `DungeonScene` inside `useEffect` so Phaser stays out of the server render path.
- `src/game/scenes/DungeonScene.ts` owns the game loop, input, combat, HUD, audio, restart flow, and Phaser object lifecycle.
- `src/game/maps/startingDungeon.ts` owns procedural map generation, tile codes, blocking rules, and map dimensions.
- `src/game/assets/manifest.ts` is the source of asset keys and public `/assets/...` paths used by the scene preload.
- `public/assets/**` contains runtime PNG, JSON, and audio assets. Many files are referenced through manifest keys rather than direct imports.

## High-priority review checks

1. Keep Phaser browser-only. Changes must not import Phaser, `DungeonScene`, `window`, `document`, `localStorage`, or browser-only APIs from a server component/module path. Preserve the dynamic import and cleanup guards in `GameCanvas` so React Strict Mode does not create duplicate Phaser games.
2. Preserve scene lifecycle cleanup. Any new global, scale, input, timer, sound, or event listener in `DungeonScene` needs a paired shutdown/destroy cleanup path. Restart and game-over flows must not leave stale sprites, masks, audio, tweens, colliders, or pooled objects active.
3. Keep asset manifest contracts synchronized. Texture/audio keys in `assetManifest` must match `preload()`, animation creation, `textures.get`, and any `play()` calls. Public asset paths should remain rooted at `/assets/...`.
4. Treat sprite sheet layout changes as code changes. Actor animations assume directional rows with 10 frames per row; powerups and several effects assume 8 frames per row. If PNG/JSON sheet dimensions or frame order change, verify the frame math in `DungeonScene.ts` changes with them.
5. Preserve tile semantics. `TileCode`, `tileAssetForCode`, `getTileCode`, `isTileBlocked`, `MAP_WIDTH`, `MAP_HEIGHT`, and generated `rows` must stay mutually consistent. Chasms (`h`) should block movement, bridges (`B`) and stairs (`S`) should stay walkable unless gameplay intentionally changes.
6. Protect simulation pacing. `MAX_SIMULATION_DT`, hit-stop constants, projectile cooldowns, enemy spawn cadence, powerup timing, and ammo/seeker limits are gameplay tuning. Flag changes that alter difficulty without an explicit reason and a smoke-test note.
7. Keep input overlays and UI reachable. Start, how-to-play, game-over, mute, keyboard movement, pointer aim/fire, space/J fire, and F3 debug paths should continue to work after UI or input changes.
8. Be careful with draw depth and isometric coordinates. Small changes to `DEPTH_BANDS`, `depthForTilePoint`, prop origins, player/enemy origins, or map offsets can create visual pop-through, hidden sprites, or incorrect hit/debug overlays.
9. Keep generated assets and tooling in sync. If source art or sheet metadata changes, expect the matching package script (`process:assets`, `process:death-assets`, `process:combat-juice`, `generate:powerups`, or `generate:combat-assets`) and generated PNG/JSON outputs to be included.
10. Preserve Next metadata behavior. `src/app/layout.tsx` builds `metadataBase` from `NEXT_PUBLIC_SITE_URL`, `VERCEL_URL`, or localhost; changes should keep local builds valid and production OpenGraph/Twitter images resolvable.

## Verification expectations

- For ordinary code changes, expect `npm run build` to pass.
- If linting is available in the active Next.js version, run `npm run lint`; otherwise note the missing/unsupported lint command instead of claiming it passed.
- For Phaser/gameplay changes, reviewers should ask for a browser smoke test covering load, resize, start, movement, aim/fire, ammo pickup, powerup pickup, mute toggle, game over/restart, and F3 debug overlay.
- If a build rewrites `next-env.d.ts` between `.next/dev/types/routes.d.ts` and `.next/types/routes.d.ts`, treat that as generated churn unless the PR intentionally changes Next route type configuration.

## What to flag

- Server/client boundary regressions that can break SSR or build.
- Missing cleanup for Phaser objects, event handlers, timers, tweens, masks, or sounds.
- Asset key/path/frame mismatches that would fail only at runtime.
- Tile-code additions without matching rendering and collision rules.
- Gameplay changes that silently bypass ammo, health, invulnerability, cooldown, spawn, pickup, or restart invariants.
- Package manager drift across `package-lock.json` and `pnpm-lock.yaml` when dependencies change.
