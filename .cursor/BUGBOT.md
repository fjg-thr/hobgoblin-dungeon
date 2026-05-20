# Cursor Bugbot review instructions

This repository is a Next.js App Router prototype for a browser-based Phaser game.
Prioritize findings that would break gameplay, builds, deployment, or asset loading.

## Review priorities

- Report runtime bugs, type-safety issues, state-management mistakes, race conditions,
  and resource leaks that affect the game loop or Next.js rendering.
- Treat `src/game/GameCanvas.tsx` as the client-only Phaser bootstrap. Flag changes
  that instantiate Phaser during server rendering, create duplicate `Phaser.Game`
  instances, or fail to destroy the game on unmount.
- Treat `src/game/scenes/DungeonScene.ts` as the main gameplay surface. Focus on
  regressions in player input, collision, enemy AI, projectile behavior, pickups,
  scoring, health/ammo state, audio toggling, and cleanup of Phaser objects.
- Preserve strict TypeScript behavior from `tsconfig.json`. Avoid suggestions that
  weaken type checking, introduce implicit `any`, or hide real errors with broad
  casts.
- Check asset manifest changes against files under `public/assets/`. Missing,
  renamed, or mismatched sprite/audio assets are user-facing bugs.
- For tooling under `tools/` and `scripts/`, review generated asset metadata and
  dimensions carefully. Do not flag generated JSON or PNG churn unless the change
  indicates a functional mismatch or broken pipeline.
- Keep feedback concise and actionable. Avoid style-only comments unless they hide a
  likely bug or make a future bug materially harder to detect.

## Expected verification

- Use `npm run build` as the primary repository-level check.
- Use `npm run lint` when the branch changes lintable application code.
- If asset-processing scripts change, verify the relevant `npm run process:*` or
  `npm run generate:*` script when practical and inspect the resulting asset diffs.

## Project context

- The game intentionally uses pixel-art rendering (`pixelArt`, `roundPixels`, and
  nearest-neighbor assets). Do not recommend antialiasing or smoothing changes unless
  they fix a concrete rendering bug.
- Collision is intentionally tile/proximity based, not a full physics system.
- The current playable loop is a prototype. Avoid requesting large architectural
  rewrites when a smaller local fix would resolve the reviewed defect.
