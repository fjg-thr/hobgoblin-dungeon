# Bugbot review guide

This repository is a Next.js app that hosts a Phaser-based dark isometric dungeon prototype. When reviewing changes, prioritize runtime regressions in the browser game loop and asset-loading paths over stylistic concerns.

## Project-specific invariants

- Keep Phaser code client-side only. Components that import or instantiate Phaser must remain behind `"use client"` boundaries or dynamic imports so server rendering does not touch browser globals.
- Preserve pixel-art rendering defaults: nearest-neighbor scaling, `pixelArt`, `roundPixels`, and disabled antialiasing are intentional.
- Treat `src/game/assets/manifest.ts` and the files under `public/assets/**` as a contract. New or renamed assets should update both the manifest and the matching sprite-sheet JSON metadata.
- Gameplay changes should preserve deterministic map bounds, collision checks, enemy/player health rules, ammo accounting, and power-up lifecycle cleanup.
- Scene changes should clean up Phaser game objects, timers, tweens, input handlers, and audio references when objects despawn or scenes restart.
- Avoid adding custom CSS for UI unless Tailwind or the existing global game-shell styling cannot express the requirement.

## Review focus

- Look for SSR/client boundary bugs, stale references after scene restart, leaked Phaser objects, incorrect depth ordering, broken collision geometry, missing asset preload entries, and mismatched animation frame keys.
- Flag changes that make generated asset tooling depend on unavailable network services at build/runtime.
- Check accessibility for React/DOM UI changes, especially any interactive controls outside the Phaser canvas.

## Useful verification

- `npm run build` validates TypeScript and the Next.js production build.
- If asset metadata changes, inspect the related generated JSON dimensions and frame names against the consuming manifest entries.
