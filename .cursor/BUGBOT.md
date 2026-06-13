# Cursor Bugbot Review Guide

Use this repository-specific context when reviewing changes in the Hobgoblin Ruin prototype.

## Repository map

- `src/app/page.tsx` renders the single full-screen game surface.
- `src/game/GameCanvas.tsx` is a client component that dynamically imports Phaser and `DungeonScene`; keep Phaser out of server-rendered modules.
- `src/game/scenes/DungeonScene.ts` owns the runtime game loop, input, combat, pickups, enemy AI, HUD, audio, restart flow, and debug overlay.
- `src/game/maps/startingDungeon.ts` generates the dungeon grid and maps tile codes to manifest tile keys.
- `src/game/assets/manifest.ts` is the source of truth for runtime asset keys, frame sizes, metadata paths, and audio paths.
- `public/assets/**` contains shipped runtime assets and JSON metadata. Generator and processor tooling lives under `tools/` and `scripts/`.

## Review priorities

1. React/Next boundaries: `GameCanvas` should remain client-only, should destroy the Phaser game on unmount, and should not create duplicate games during React Strict Mode remounts.
2. Phaser lifecycle safety: scene restart/game-over changes must reset mutable arrays, timers, active effects, input state, audio state, and pooled objects consistently.
3. Per-frame performance: avoid allocations, asset loads, texture generation, event listener registration, or expensive path work inside hot `update` loops unless bounded and intentional.
4. Asset contracts: when manifest keys, frame sizes, rows, or metadata paths change, verify the corresponding files under `public/assets/**` and animation frame ranges change together.
5. TypeScript/Next correctness: preserve strict TypeScript compatibility and the App Router client/server split; do not depend on browser globals outside client-only paths.
6. Gameplay invariants: keep collision, camera follow, damage invulnerability, ammo limits, pickup caps, and enemy spawn safe-distance rules coherent when changing combat or progression.

## Known existing mismatches

- README controls mention `Space` or `J` for firing. Current code binds keyboard firing to `Space` and also supports pointer/click firing. Do not block unrelated PRs solely on the `J` mismatch; flag it when a PR touches input controls or docs.
- README documents regular ammo, quickshot, haste, ward, blast, and heart pickups, but does not describe seeker ammo. Current code unlocks seeker ammo after 4 kills or 30 seconds.
- README calls blast a rare late-game power-up. Current code unlocks blast after 2 kills or 16 seconds and gives it a relatively high spawn weight. Treat this as an existing docs/code mismatch unless the PR intentionally changes progression.
- This repo does not configure Tailwind or ShadCN. UI changes should follow the existing semantic markup and `src/app/globals.css` patterns.

## Verification guidance

For code changes, prefer:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`next lint` is present in `package.json` but is unreliable with the current Next version. If verification rewrites `next-env.d.ts` or creates `tsconfig.tsbuildinfo`, restore/remove those generated files unless the PR intentionally changes type-generation behavior.

For asset or gameplay changes, add manual smoke coverage in the browser where possible:

- Start screen appears and transitions into a run.
- Movement, pointer aiming/click firing, and `Space` firing work.
- Ammo pickups, seeker ammo, power-ups, heart pickups, mute toggle, restart, and game-over flow still behave.
- `F3` debug overlay toggles without affecting normal play.

## Managed Bugbot activation boundary

This file gives Cursor Bugbot review context. It does not prove that the managed Bugbot service is enabled. End-to-end deployment still requires the Cursor dashboard/org setting, Cursor GitHub App access to this repository, and a PR smoke check that confirms Bugbot posts a review or status.
