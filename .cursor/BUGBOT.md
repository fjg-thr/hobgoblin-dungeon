# Cursor Bugbot review guide

Use this guide when reviewing pull requests for the Hobgoblin Ruin prototype.

## Project shape

- Next.js App Router app with a React client entry point in `src/app/page.tsx`.
- The Phaser game is mounted by `src/game/GameCanvas.tsx`.
- Most gameplay lives in `src/game/scenes/DungeonScene.ts`; map helpers are in `src/game/maps/startingDungeon.ts`.
- Asset keys and paths are centralized in `src/game/assets/manifest.ts`.
- Generated and processed asset/audio tooling lives under both `tools/` and `scripts/`; generated runtime assets live under `public/assets`.

## Review priorities

1. Client/server boundaries
   - Keep Phaser, `window`, DOM, pointer, keyboard, and audio access inside client-only code.
   - Check that dynamic imports and `"use client"` boundaries still prevent server-side Phaser execution.
2. Phaser lifecycle and cleanup
   - New scene listeners, timers, tweens, sounds, input handlers, and game objects should be cleaned up or naturally owned by the scene lifecycle.
   - Watch for duplicated listeners across restart, game-over, modal, and mute flows.
3. Gameplay invariants
   - Movement, collision, camera follow, projectile lifetime, ammo limits, health, ward protection, scoring, and enemy spawn pressure should remain deterministic enough to reason about.
   - Changes to pickups or power-ups should preserve capped ammo/health and clear HUD/debug feedback.
4. Asset manifest consistency
   - New asset files should be listed in `src/game/assets/manifest.ts` and in README asset docs when user-facing.
   - Sprite-sheet frame sizes, frame counts, animation rows, and paths should match the actual generated files.
5. Accessibility and UI basics
   - React/DOM UI changes should preserve labels, keyboard access, readable text, and responsive layout.
   - Phaser-only controls should still be documented in the in-game how-to-play modal or README when behavior changes.

## Known existing mismatches

Do not block unrelated PRs solely for these existing documentation/code mismatches, but call them out when a PR touches the related behavior:

- README says `Space` or `J` fires; current gameplay binds keyboard firing to `SPACE` and supports pointer/click firing.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast, but does not document seeker ammo. Current code unlocks seeker ammo after progression and uses seeker pickups/projectiles.
- README describes blast as a rare late-game power-up; current `POWERUP_CONFIG.blast` unlocks after 2 kills or 16 seconds.

## Suggested checks

Use the narrowest checks that match the PR. For most code changes:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Also run targeted manual smoke checks for gameplay PRs:

- Start screen opens and how-to-play modal closes.
- WASD/arrow movement, pointer aim, `Space` fire, click fire, mute toggle, and restart work.
- Ammo pickups, heart pickups, quickshot, haste, ward, blast, seeker ammo, goblins, and brutes still behave as expected when touched by the PR.
- Debug overlay toggles with `F3` and does not affect normal play.

`npm run lint` currently maps to `next lint`, which may not be reliable with the installed Next.js version. Prefer build and TypeScript verification unless the PR updates lint tooling.

## Generated artifacts

Build and typecheck commands can rewrite or create local generated files such as `next-env.d.ts`, `.next/`, and `tsconfig.tsbuildinfo`. Reviewers should distinguish generated local artifacts from intentional source changes and ask authors to clean accidental churn.

## Managed Bugbot deployment boundary

This file gives Cursor Bugbot repository-specific review context. It does not, by itself, prove that the managed Bugbot service is enabled. Full deployment verification still requires:

- Cursor dashboard or organization setting enables Bugbot for this repository.
- The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
- A PR smoke check confirms Bugbot posts a review, comment, or status on a test pull request.

If those external checks are unavailable, state that the repository guidance is installed but managed-service activation could not be verified from this environment.
