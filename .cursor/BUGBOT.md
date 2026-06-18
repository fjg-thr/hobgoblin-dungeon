# Cursor Bugbot review guide

Use this file as the repository-specific context for Bugbot reviews of
Hobgoblin Ruin Prototype. Bugbot service enablement is managed outside this
repository through Cursor dashboard settings, GitHub App repository access, or
the Cursor Bugbot API. This file only supplies review guidance after it lands on
the default branch.

Manual review triggers documented by Cursor:

- `cursor review`
- `bugbot run`
- `cursor review verbose=true` or `bugbot run verbose=true` for troubleshooting
  logs and request IDs.

## Project map

- Next.js App Router entrypoints live in `src/app`.
  - `src/app/page.tsx` renders `GameCanvas`.
  - `src/game/GameCanvas.tsx` is client-only and dynamically imports Phaser and
    `DungeonScene` before creating the Phaser game.
  - `src/app/layout.tsx` owns metadata and currently references
    `/opengraph-image.png`.
- Phaser gameplay is concentrated in `src/game/scenes/DungeonScene.ts`.
- Map generation and tile metadata live in `src/game/maps/startingDungeon.ts`.
- Runtime asset paths are defined in `src/game/assets/manifest.ts`.
- Static assets live under `public/assets`.
- Asset/audio generator and processing tooling lives under both `tools/` and
  `scripts/`; generated runtime audio source of truth is
  `assetManifest.audio`, while `public/assets/audio/audio-manifest.json` is
  auxiliary consistency metadata.

## Review priorities

1. Flag gameplay regressions that affect movement, collision, camera behavior,
   firing, enemy spawning/pathing, damage, pickups, score, HUD, start/game-over
   flow, audio toggling, or debug overlay behavior.
2. Flag Next.js or React regressions that break SSR/client boundaries. Phaser
   must remain behind the client-only `GameCanvas` dynamic import path; avoid
   importing Phaser directly from server components.
3. Check asset manifest changes against files in `public/assets`. Runtime loads
   should reference files that exist and match expected sprite frame sizes or
   JSON metadata where applicable.
4. For metadata/OpenGraph changes, verify that referenced public assets exist.
   The current repository has an existing `/opengraph-image.png` metadata
   reference; only block unrelated PRs for this if the PR touches metadata or
   public share-image inventory.
5. Prefer fixes that fit the current small prototype structure. Do not request
   broad rewrites, dependency churn, or new CI infrastructure unless the PR
   already changes that area or the issue is directly blocking correctness.
6. This repo does not currently use Tailwind or ShadCN. UI styling should follow
   semantic markup and the existing `src/app/globals.css` pattern unless a PR
   intentionally introduces a styling system.

## Known baseline context

- README says `Space` or `J` fires. Current runtime binding in
  `DungeonScene.ts` fires from `Space` and pointer/click input; treat the `J`
  mismatch as an existing docs/runtime mismatch unless a PR touches controls or
  README control documentation.
- README documents regular ammo, heart pickups, quickshot, haste, ward, and
  blast. Current code also unlocks seeker ammo after 4 kills or 30 seconds and
  uses seeker pickups/projectiles.
- README describes blast as rare late-game, but current code unlocks blast after
  2 kills or 16 seconds via `POWERUP_CONFIG.blast`.
- `next lint` is not reliable with current Next versions because the script uses
  `next lint`. Prefer build/type checks for review verification.
- The package intentionally has no `npm start` script.

## Suggested verification

When reviewing PRs, ask for or run the smallest relevant subset:

- `npm ci`
- `npm run build`
- `npx tsc --noEmit`
- `git diff --check <base>...HEAD`

If verification rewrites `next-env.d.ts`, creates `.next/`, or emits
`tsconfig.tsbuildinfo`, treat those as generated artifacts and keep the working
tree clean unless the PR intentionally changes generated typing behavior.

For gameplay-sensitive changes, add a manual smoke note when possible:

- Load the app in a browser.
- Start the game from the title screen.
- Move with WASD or arrow keys.
- Aim with the pointer, fire with Space and click.
- Collect ammo, hearts, and power-ups.
- Toggle sound with the lower-right button.
- Press F3 to confirm debug overlay behavior if the PR touches collision, maps,
  camera, or placement logic.

## Review output expectations

- Lead with real bugs and concrete risk. Include file and line references.
- Distinguish existing baseline mismatches from regressions introduced by the
  PR.
- Avoid blocking on subjective polish unless it affects correctness,
  accessibility, maintainability, performance, or shipped user behavior.
- Keep suggested fixes scoped to the files and systems the PR changes.
