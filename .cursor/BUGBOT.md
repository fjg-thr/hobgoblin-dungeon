# Bugbot review guide

Use these repository rules when reviewing pull requests for this project.

## Project context

- This is a Next.js React app that boots a Phaser dungeon game from `src/game/GameCanvas.tsx`.
- Most gameplay state, rendering, input, audio, spawning, and collision behavior live in `src/game/scenes/DungeonScene.ts`.
- Static art/audio data is stored under `public/assets`, with manifests in `src/game/assets/manifest.ts` and JSON sprite-sheet metadata beside generated assets.
- Asset generation and processing scripts live in `tools` and `scripts`.

## Review priorities

1. Flag client/server boundary regressions. Phaser and browser-only APIs must stay in client-only code paths and must not run during Next.js server rendering.
2. Check Phaser lifecycle changes carefully. New event listeners, timers, tweens, audio nodes, textures, and scene objects should be cleaned up or owned by the scene lifecycle.
3. Preserve strict TypeScript behavior. Avoid `any`, unsafe casts, implicit nullable access, and broad suppression comments unless they are justified by a Phaser or browser API limitation.
4. Verify gameplay changes against coordinate-space assumptions. Movement, aiming, collision, camera follow, projectile paths, and spawn logic should account for the isometric transform and current room bounds.
5. For asset changes, confirm referenced file paths, manifest entries, sprite-sheet frame sizes, animation frame names, and generated metadata remain consistent.
6. Keep performance-sensitive scene code allocation-aware. Avoid unnecessary per-frame object creation, repeated asset lookups, and unbounded arrays in update loops.
7. Protect user-facing controls and accessibility around React UI surfaces. Keyboard, click, and focus behavior should remain usable, especially for overlays and controls outside the Phaser canvas.
8. Prefer narrow fixes over broad refactors in `DungeonScene.ts`; call out unrelated rewrites that increase review risk.

## Verification to request when relevant

- `npm run build` for production compilation.
- `npx tsc --noEmit` for TypeScript-only validation if build output is noisy or unrelated.
- Manual browser smoke testing for gameplay behavior that automated checks cannot cover: boot screen, movement, aiming/firing, enemy damage, pickups, mute toggle, game over, and restart.

Do not require a GitHub Actions workflow for Bugbot itself. Cursor Bugbot runs through the Cursor GitHub App integration and repository/dashboard enablement.
