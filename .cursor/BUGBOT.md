# Bugbot Review Instructions

This repository is a Next.js game prototype that renders a Phaser scene through a client-only React wrapper. Review changes for runtime regressions in both the React app shell and the Phaser game loop.

## High-priority checks

- Flag server/client boundary issues in Next.js files. Phaser code must stay behind client-only imports or dynamic imports so builds do not evaluate browser-only APIs on the server.
- Check Phaser object lifecycles carefully. Timers, tweens, input handlers, sounds, and scene-owned display objects should be cleaned up or recreated in a way that does not leak across scene restarts.
- Validate gameplay state transitions. Pay close attention to start, playing, game-over, restart, mute, pickup, damage, ammo, scoring, and enemy-spawn flows.
- Watch for asset key and frame-name mismatches between `src/game/assets/manifest.ts`, JSON sprite sheets, and scene code. Missing assets should fail review even if TypeScript passes.
- Treat map generation, collision, projectile movement, and enemy pathing as behavior-sensitive areas. Look for edge cases caused by coordinate transforms, camera scaling, and tile bounds.
- Preserve strict TypeScript behavior. Avoid `any`, unsafe casts, and unchecked nullable values unless the code has a clear invariant nearby.
- Keep styling in the existing global CSS/Tailwind-free pattern unless a change deliberately introduces a broader styling system.

## Test expectations

- For TypeScript, React, or Phaser scene changes, expect at least `npm run build` to pass.
- If package scripts change, verify the updated script exists and runs in a fresh checkout.
- For asset-processing tools, check that generated file paths and manifest references remain consistent.

## Review style

- Prioritize concrete bugs and regressions over subjective refactors.
- Include file and line references in findings.
- Do not request broad architecture rewrites unless the changed code introduces a real maintenance or correctness risk.
