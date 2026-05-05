# Bugbot review guidance

This repository is a Next.js prototype that hosts a Phaser-based isometric dungeon game. Prioritize findings that can break gameplay, rendering, asset loading, or production builds.

## Review priorities

- Verify changes keep the Next.js app client-safe. Phaser usage should stay behind client-only boundaries such as `src/game/GameCanvas.tsx`.
- Check that asset manifest entries, generated JSON metadata, and files under `public/assets` remain in sync. Missing or mismatched frame names should be treated as gameplay-breaking.
- Look for gameplay regressions in `src/game/scenes/DungeonScene.ts`, especially collision, enemy pathing, projectile lifecycle, power-up state, scoring, health, ammo, audio mute state, and scene restart cleanup.
- Flag changes that introduce nondeterministic crashes during scene creation or updates, including unchecked optional values from maps, assets, or Phaser game objects.
- Prefer focused, actionable bug reports over broad refactor suggestions. This prototype intentionally keeps much of the game loop in a single scene file.

## Verification expectations

- Run `npm run build` for production-safety checks when code changes affect TypeScript, Next.js, Phaser integration, or asset imports.
- If a change touches asset-processing scripts, verify the relevant `npm run process:*` or `npm run generate:*` command when practical.
- Manual browser verification is useful for gameplay feel, but automated build failures are higher priority for review comments.
