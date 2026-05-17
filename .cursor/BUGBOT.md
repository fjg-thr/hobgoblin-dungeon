# Cursor Bugbot review guide

Use this repository-specific context when reviewing changes in Hobgoblin Ruin, a public Next.js App Router browser-game prototype built with React, TypeScript, Phaser 4, and static assets under `public/assets`.

## Review priorities

1. **Client/server boundaries**
   - `src/game/GameCanvas.tsx` must remain a client component.
   - Keep Phaser, `window`, pointer, keyboard, audio, canvas, and other browser-only APIs out of server components and module paths that Next.js may evaluate during server rendering.
   - Prefer dynamic imports or client-only effects for Phaser boot code, and verify cleanup destroys the Phaser game instance on unmount.

2. **Phaser scene lifecycle**
   - Watch changes in `src/game/scenes/DungeonScene.ts` for leaked listeners, timers, tweens, sounds, graphics, containers, masks, textures, pooled objects, and scene-level state that survives restart.
   - Confirm start screen, how-to-play, game-over, restart, mute, debug overlay, and resize paths keep input handlers and display objects consistent.
   - Flag code that creates assets or animations repeatedly without idempotent keys or cleanup.

3. **Gameplay regressions**
   - Protect the feel of isometric movement, pointer aiming, 15-degree shot snapping, finite ammo, seeker ammo, enemy pathing, difficulty ramp, power-ups, hearts, blast damage, hit stop, invulnerability, scoring, and debug overlays.
   - Check collision and spawn changes against blocked tiles, prop collision boxes, safe spawn distances, pickup radii, and camera follow behavior.
   - For input changes, verify keyboard and pointer behavior still work together and do not fire while menus or overlays should consume interaction.

4. **Asset and metadata consistency**
   - `src/game/assets/manifest.ts`, `README.md` asset lists, generated JSON metadata, and files in `public/assets/**` should agree on paths, frame sizes, keys, and row/column assumptions.
   - If an asset path is added to the manifest, the matching file should be committed under `public/assets`.
   - Processing scripts live in `tools/` and `scripts/`; source prompts and paths are documented in `ASSET_PROMPTS.md` and `README.md`, with saved source images referenced under `public/assets/source` when present.

5. **Next metadata and public assets**
   - `src/app/layout.tsx` currently references `/opengraph-image.png`. If a change touches share-image metadata or public social-preview assets, verify the referenced file exists or that the metadata intentionally changes.
   - Do not infer repository privacy from `package.json` `"private": true`; this only prevents npm publication.

## Verification guidance

- Prefer `npm run build` for the main integration check.
- Prefer `npx tsc --noEmit --incremental false` for a side-effect-free TypeScript check.
- `npm run lint` currently maps to `next lint`; with the lockfile-resolved Next.js version this is not a valid integrated subcommand and may fail with `Invalid project directory provided, no such directory: /workspace/lint`. Treat that as a tooling limitation unless the PR changes lint setup.
- If Next.js generates `next-env.d.ts` route-type churn during local checks, verify whether it is intentional before accepting it.
- Use `git diff --check` or equivalent whitespace checks for generated guidance and asset metadata edits.

## Things to call out strongly

- Any server-rendered import path that can load Phaser or browser globals.
- Missing cleanup for Phaser resources, global listeners, sound loops, or generated textures.
- Manifest entries without committed assets, committed assets without manifest/readme updates when they are meant to be loaded, or stale frame dimensions.
- Gameplay changes that make menus, restart, mute, debug mode, aiming, ammo, pickups, or enemy pressure inconsistent with the README controls and known limitations.
