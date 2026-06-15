# Cursor Bugbot review guidelines

Use these rules when reviewing pull requests for the Hobgoblin Ruin Prototype. Bugbot itself is a managed Cursor/GitHub App service; this file provides repository-specific review context and does not replace enabling the integration in the Cursor dashboard.

## Project context

- Stack: Next.js App Router, React, TypeScript strict mode, and Phaser 4.
- Runtime UI entry points live in `src/app/` and `src/game/GameCanvas.tsx`.
- Core gameplay lives mostly in `src/game/scenes/DungeonScene.ts`.
- Map, asset, and manifest code lives under `src/game/maps/` and `src/game/assets/`.
- Generated and processed art/audio assets live under `public/assets/`.
- Asset generator and processor tooling lives under both `tools/` and `scripts/`.

## Review priorities

1. Catch runtime regressions in gameplay state, combat, collision, pickups, scoring, and scene lifecycle behavior.
2. Check React/Phaser boundaries for safe client-only loading, mount/unmount cleanup, resize behavior, and SSR compatibility.
3. Verify asset manifest updates match committed files under `public/assets/` and that sprite-sheet metadata stays consistent with loader code.
4. Flag TypeScript type-safety regressions, unsafe casts, and changes that bypass strict-mode guarantees.
5. Watch for memory leaks from Phaser event listeners, timers, tweens, physics objects, and scene shutdown paths.
6. Review accessibility and semantic HTML in the Next.js shell where applicable; this repo does not use Tailwind or ShadCN.

## Existing behavior to keep in mind

- Movement uses `WASD` or arrow keys.
- Aiming uses pointer movement; click aims and fires once.
- Keyboard firing is implemented around `Space` in the game scene. The README also mentions `J`; treat that as an existing documentation/code mismatch unless a PR intentionally changes controls or docs.
- README describes quickshot, haste, ward, blast, ammo, and heart pickups. The code also includes seeker ammo behavior; do not require README updates unless the PR touches related gameplay docs or seeker behavior.
- README describes blast as a rare late-game power-up, while current code unlocks blast earlier through gameplay thresholds. Treat this as an existing mismatch unless the PR explicitly changes blast progression.
- Collision is intentionally simple tile/proximity logic, not a full physics system.
- The staircase is visible but does not yet transition to another level.

## Generated files and assets

- Do not request review changes for generated binaries or sprite sheets unless the PR also changes manifest references, loader code, metadata JSON, or asset-generation scripts.
- When asset JSON changes, verify frame sizes, frame counts, keys, and paths line up with `src/game/assets/manifest.ts` and loader usage.
- Prefer reviewing source/tooling changes in `tools/`, `scripts/`, and manifest code over commenting on binary image/audio diffs.

## Checks before approval

Run or verify these commands when relevant:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`npm run lint` currently maps to `next lint`, which is not reliable with newer Next.js versions in this repo. Prefer build plus TypeScript checks unless the project scripts change.

## Managed service verification

Repository files alone cannot prove that Cursor Bugbot is enabled. To confirm deployment of the managed reviewer, verify all of the following outside this repository:

1. Cursor dashboard integration is connected to the GitHub account or organization.
2. The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
3. Bugbot is enabled for this repository and configured to review pull requests.
4. A pull request smoke check receives an automatic Bugbot review, or a maintainer can trigger one with a comment such as `cursor review` or `bugbot run`.

