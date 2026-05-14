# Cursor Bugbot Review Guidance

Use these repository-specific instructions when reviewing changes in this project.

## Project map

- This is a private Next.js / React / TypeScript prototype for a dark, GBA-inspired isometric dungeon game.
- `src/app/page.tsx` renders only the game shell. Keep it small and server-safe.
- `src/game/GameCanvas.tsx` is the client boundary. It dynamically imports Phaser and `DungeonScene`, creates one `Phaser.Game`, and destroys it on React cleanup.
- `src/game/scenes/DungeonScene.ts` contains the Phaser scene, gameplay state, input handling, UI overlays, audio, combat, pickups, camera, and lifecycle cleanup.
- `src/game/assets/manifest.ts` is the contract between code and files under `public/assets/**`.
- `src/game/maps/startingDungeon.ts` owns dungeon generation, tile codes, room/corridor placement, props, and spawn points.
- Asset generation and processing scripts live under `tools/**` and `scripts/**`; they are not loaded at runtime by the browser.

## Highest-priority review risks

1. **Client/server boundary regressions**
   - Browser-only APIs (`window`, `document`, `localStorage`, Phaser imports, canvas creation, pointer input) must stay inside client-only code paths.
   - `GameCanvas.tsx` should remain a client component and should continue to lazy-load Phaser instead of importing it at module scope.
   - Avoid adding browser globals to Next app files that can render on the server unless they are guarded.

2. **Phaser lifecycle and cleanup**
   - New `scale`, `input`, `events`, timer, tween, sound, or animation listeners need cleanup on scene shutdown or object destruction.
   - Watch for duplicated listeners across scene restarts, start-screen transitions, modal open/close, game-over, and React Strict Mode remounts.
   - Destroy sprites, containers, generated textures, tweens, and transient effect objects that can accumulate during long play sessions.

3. **Gameplay state correctness**
   - Changes to movement, collision, projectile lifetime, enemy attacks, knockback, hit stop, pickups, power-up timers, scoring, health, ammo, and game-over flow should preserve deterministic state transitions inside the scene update loop.
   - Check tile-space versus screen-space math carefully. Isometric coordinates use constants from `startingDungeon.ts`; mixing world pixels and tile coordinates can cause subtle collision or spawn bugs.
   - Inputs should not fire gameplay actions while the start screen, how-to-play modal, or game-over UI owns pointer/keyboard focus.

4. **Asset manifest contracts**
   - Every manifest path in `src/game/assets/manifest.ts` must correspond to a committed file in `public/assets/**`.
   - Sprite-sheet frame sizes, row counts, row ordering, animation frame ranges, and metadata JSON should match the actual generated assets.
   - When adding processed assets, include both the runtime asset and any JSON metadata that the loader or animation code expects.

5. **Next.js metadata and deploy assets**
   - `src/app/layout.tsx` references `/opengraph-image.png`; verify `public/opengraph-image.png` remains committed if metadata changes touch the share image.
   - Keep `metadataBase` compatible with `NEXT_PUBLIC_SITE_URL`, Vercel preview URLs, and local development.

6. **TypeScript and React quality**
   - Preserve `strict` TypeScript compatibility. Avoid broad `any`, unsafe casts, and nullable state assumptions in gameplay code.
   - Prefer small helpers with explicit types when expanding `DungeonScene.ts`; it is already large and easy to regress.
   - React components should keep stable refs/effects and should not recreate Phaser games unnecessarily.

## Verification expectations

For code changes, request or run these checks when relevant:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check
```

Notes:

- `npm run lint` currently maps to `next lint`; with the locked Next.js 16 CLI this is not a reliable review gate in this repository. Prefer build and TypeScript checks until the lint script is migrated.
- `next build` or `tsc --noEmit` can generate local artifacts such as `tsconfig.tsbuildinfo` or update generated Next files. Do not treat that churn as intentional unless the change explicitly requires it.
- For asset-only changes, also verify the referenced files exist with `git ls-files --error-unmatch <path>` for each new runtime asset.

## Review output style

- Prioritize concrete bugs, runtime regressions, missing cleanup, broken asset references, and missing verification.
- Include exact file and line references for findings.
- Avoid broad style advice unless it prevents a real bug or maintainability problem in a changed area.
- If no issues are found, say so and mention any checks that were not run.
