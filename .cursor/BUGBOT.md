# Bugbot Review Instructions

Review pull requests for bugs that would affect runtime behavior, builds, or maintainability of the playable prototype. Prioritize issues that a human reviewer would need to fix before merging.

## Focus areas

- Next.js client/server boundaries: Phaser game code must stay behind client-only React components and must not access browser APIs during server render.
- TypeScript strictness: flag unsafe narrowing, unchecked optional values, or type assertions that could hide runtime failures.
- Phaser lifecycle: check for leaked event listeners, timers, tweens, physics objects, or scene state that survives restart/game-over flows unexpectedly.
- Gameplay regressions: movement, aiming, ammo, enemy spawning, pickups, scoring, collision, camera behavior, start/game-over screens, and mute controls should keep their documented behavior.
- Asset consistency: references in `src/game/assets/manifest.ts` should match files under `public/assets`, and sprite-sheet frame metadata should remain compatible with the loading code.
- Build health: call out changes likely to break `npm run lint` or `npm run build`.

## Noise to avoid

- Do not comment on generated image/audio assets or sprite-sheet JSON unless the diff introduces a concrete loader/runtime problem.
- Do not request broad refactors, formatting-only changes, or style preferences unless they prevent a real bug.
- Treat `README.md` known limitations as intentional prototype constraints unless a pull request claims to solve one.

## Useful local checks

```bash
npm run lint
npm run build
```
