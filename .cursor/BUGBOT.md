# Cursor Bugbot review guide

Use this repository-specific context when reviewing pull requests for the
Hobgoblin Ruin prototype.

## Project shape

- Next.js App Router serves a single playable page in `src/app/page.tsx`.
- `src/game/GameCanvas.tsx` is a client component that dynamically imports
  Phaser and creates/destroys the game instance from a React effect.
- The main gameplay implementation is `src/game/scenes/DungeonScene.ts`; map
  generation helpers live in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths are centralized in `src/game/assets/manifest.ts` and
  should match files under `public/assets`.
- Asset/audio generation and processing scripts live under both `tools/` and
  `scripts/`. Generated runtime assets should be reviewed intentionally, not as
  incidental churn.

## Review priorities

1. **Client/server boundaries**: Phaser code must remain behind the client-only
   canvas boundary. Avoid importing Phaser-dependent modules from server
   components or metadata code.
2. **Phaser lifecycle cleanup**: New event listeners, timers, tweens, sounds,
   sprites, and scene resources should be cleaned up on scene shutdown or game
   destruction. Watch for duplicate listeners after scene restart.
3. **Gameplay invariants**: Check ammo caps, seeker ammo unlocks, power-up
   durations, blast charge consumption, enemy damage/death paths, score updates,
   and game-over/restart resets.
4. **Asset consistency**: New assets need manifest entries, matching JSON
   metadata when applicable, correct frame sizes, and committed runtime files.
   Avoid broken case-sensitive paths.
5. **UI/accessibility basics**: The game canvas is visual and keyboard-driven;
   surrounding React UI should remain semantic, readable, and usable with the
   documented controls.

## Known existing mismatches

Treat these as existing repo state unless a PR explicitly targets them:

- README says `Space` or `J` fires, but current code binds shooting to `Space`
  and pointer/click firing.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast, but
  current code also unlocks seeker ammo after 4 kills or 30 seconds.
- README describes blast as rare late-game, while current code unlocks blast
  after 2 kills or 16 seconds.

## Suggested checks

Prefer these for normal code changes:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Notes:

- `npm run lint` currently maps to `next lint`, which is not reliable with the
  Next version in this project. Do not require it unless the tooling changes.
- Build/typecheck commands can generate or rewrite `.next/`, `next-env.d.ts`,
  and `tsconfig.tsbuildinfo`; these should not be committed unless the PR is
  intentionally changing generated typing behavior.
- If a PR changes assets or generator scripts, inspect the runtime asset files
  and manifest together.

## Managed Bugbot activation

This file provides repository context for Cursor Bugbot reviews. It does not by
itself prove that the managed Bugbot service is enabled. End-to-end activation
still depends on Cursor dashboard or organization settings, Cursor GitHub App
repository access, and a pull request review/status smoke check.
