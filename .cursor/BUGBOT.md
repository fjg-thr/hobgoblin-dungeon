# Cursor Bugbot Review Guidance

This file guides Cursor Bugbot for `fjg-thr/hobgoblin-dungeon` after it is merged to the default branch. It does not enable the managed service by itself.

To verify deployment, confirm Cursor dashboard/GitHub integration access to this repo, Bugbot enabled for the repo, and a live PR smoke review. Manual PR comments supported by Bugbot are `cursor review` and `bugbot run`; use `cursor review verbose=true` or `bugbot run verbose=true` only when diagnostics, request IDs, or log detail are needed. GitHub Actions are not required for Bugbot, though CI can complement reviews.

## Project context

- Next.js App Router + React + TypeScript renders a Phaser 4 dungeon prototype.
- `src/game/GameCanvas.tsx` is the client-only Phaser bootstrap. Keep Phaser imports dynamic/client-side, destroy the game on unmount, and avoid SSR/hydration regressions.
- `src/game/scenes/DungeonScene.ts` owns most runtime behavior: procedural dungeon state, collisions, combat, HUD, audio, input, timers, and scene lifecycle.
- Runtime assets are declared in `src/game/assets/manifest.ts`. Treat `assetManifest.audio` as the runtime audio source of truth; `public/assets/audio/audio-manifest.json` is auxiliary consistency data.

## Review priorities

1. Flag changes that leak Phaser listeners, timers, tweens, sound instances, sprites, or resize/input handlers across scene restart, shutdown, or React unmount.
2. Check movement, collision, camera follow, enemy spawning, projectile cleanup, damage immunity, pickup expiry, score/ammo/heart HUD updates, and game-over/restart state transitions for regressions.
3. For input changes, verify keyboard, pointer, and canvas hit zones remain usable. Current runtime firing is `Space` plus pointer/click; README mention of `J` is a known baseline mismatch unless an input/docs PR touches it.
4. For powerups and ammo, validate progression gates, stack/expiry behavior, visual feedback, and audio cues. Seeker ammo exists in code but is under-documented; README blast timing also has baseline drift. Block only changes that worsen or touch those contracts.
5. For assets and audio, require manifest paths, frame sizes, keys, spritesheet metadata, and preloads to stay aligned. Do not spend review effort on binary PNG/WAV diffs unless the PR also changes generation logic or references.
6. For `tools/` and `scripts/`, review path handling, idempotency, chroma-key/resize assumptions, and whether generated outputs remain reproducible. Relevant generators include `tools/generate_audio_sfx.mjs` and `scripts/generate-retro-soundtrack.mjs`.
7. For app metadata and DOM/CSS changes, use existing `src/app/globals.css` patterns. `/opengraph-image.png` is referenced by metadata but missing on this baseline; only block PRs that touch share-image behavior or make that issue worse.
8. Treat dependency/tooling hardening as separate unless requested. This repo currently has both npm and pnpm lockfiles and `latest` dependency ranges; prefer npm commands because `package-lock.json` is present.

## Expected verification

Ask authors to report the commands they ran and any manual gameplay smoke checks. Useful local checks:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`npm run lint` may be unreliable with the current Next.js baseline. Existing npm audit advisories should be reported but should not block unrelated PRs unless the PR changes dependencies or security-sensitive code.

Manual gameplay checks should cover starting a run, movement/collision, `Space` firing, click firing, ammo reload pickups, at least one powerup, enemy damage/death, mute toggle, game over, and restart.

## Review style

Prioritize concrete correctness, regression, security, accessibility/UX, and maintainability issues. Cite files and behavior. Avoid noisy comments on generated assets, known baseline drift, or broad refactors unrelated to the PR.
