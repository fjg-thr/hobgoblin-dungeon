# Cursor Bugbot Review Guide

Use this guide when Cursor Bugbot reviews pull requests for this repository.
Focus on behavioral regressions, broken builds, missing assets, and mismatches
between the public game documentation and the runtime Phaser implementation.

## Managed enablement

This file supplies repository-specific review guidance only. It does not prove
that the hosted Cursor Bugbot service is enabled for the repository.

When validating deployment outside this branch, confirm the external pieces:

- Cursor dashboard or organization settings have Bugbot enabled for this repo.
- The Cursor GitHub App has repository access and can read pull requests.
- Any Bugbot Admin API credentials used by the organization are configured.
- A live PR review smoke check has run, or the missing access is documented.

For a manual smoke check on a pull request, add a top-level PR comment with one
of these commands:

```text
cursor review
bugbot run
```

For diagnostics, use verbose mode in a top-level PR comment:

```text
cursor review verbose=true
bugbot run verbose=true
```

Verbose mode is for request IDs, logs, and troubleshooting. Do not treat it as a
substitute for checking the actual review findings.

## Repository overview

- Next.js app router entry points live in `src/app/`.
- The game mounts through `src/game/GameCanvas.tsx`.
- Most gameplay state, input, rendering, audio, HUD, title screen, and modal
  behavior live in `src/game/scenes/DungeonScene.ts`.
- The tile map seed and dungeon layout helpers live in
  `src/game/maps/startingDungeon.ts`.
- Runtime asset paths and audio entries come from `src/game/assets/manifest.ts`.
- Generated and source assets live under `public/assets/`.
- Asset generation and processing scripts live under `tools/` and `scripts/`.

## Standard verification

For source code changes, prefer:

```bash
npm run build
npx tsc --noEmit --incremental false
```

`next lint` is not reliable for this Next 16 project, even though the script is
still present. Do not block a PR only because `next lint` is unavailable if the
build and TypeScript checks are clean.

For asset-only or documentation-only changes, verify the files named in the PR
exist, are tracked, and match the runtime manifest or documentation references.
When generated route types rewrite `next-env.d.ts`, confirm the change is
intentional. `next dev` can point it at `.next/dev/types/routes.d.ts`; production
builds can point it at `.next/types/routes.d.ts`.

## High-priority review areas

### Gameplay and controls

- Runtime shooting is `Space` and pointer/click firing in
  `DungeonScene.ts`. The README currently also mentions `J`; treat that as an
  existing docs/code mismatch unless a PR touches controls or input docs.
- Movement should remain WASD and arrow-key based unless the PR explicitly
  changes controls.
- The title screen and how-to-play modal are Phaser-rendered in
  `DungeonScene.ts`. Check compact and tiny viewport branches, close behavior,
  button hit zones, and copy that describes runtime controls.
- Debug overlay behavior is tied to `F3`; avoid accidental always-on debug
  rendering or production-only crashes.

### Combat, pickups, and progression

- Preserve finite ammo behavior and ammo pickups unless the PR intentionally
  changes the economy.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast.
  Current code also supports seeker ammo after progression thresholds; review
  seeker ammo changes against code-defined behavior even if README coverage is
  incomplete.
- Blast rarity and unlock timing may be controlled by `POWERUP_CONFIG`; the
  README wording may lag implementation. Do not block unrelated PRs for that
  existing mismatch, but flag PRs that worsen or claim to fix it without tests
  or smoke coverage.
- Check enemy contact damage, ward prevention, heart pickup constraints, and
  projectile collision when combat constants or actor hitboxes change.

### Assets and manifest drift

- `src/game/assets/manifest.ts` is the runtime source of truth, especially
  `assetManifest.audio`. `public/assets/audio/audio-manifest.json` is auxiliary
  and should stay consistent only when touched.
- Any path added to a manifest must have the matching file under `public/`.
- Any removed or renamed asset must update every manifest, load call, and README
  asset reference that points to it.
- Watch for missing-asset drift in sprite-sheet JSON/PNG pairs. Frame sizes,
  frame counts, and row assumptions should stay compatible with Phaser loaders.
- Generated image or audio changes should mention the script used, for example:
  - `python3 tools/process_assets.py`
  - `python3 tools/process_corporate_goblin_assets.py`
  - `python3 tools/process_spreadsheet_brute_assets.py`
  - `node tools/generate_audio_sfx.mjs`
  - `node scripts/generate-retro-soundtrack.mjs`

### Audio

- Confirm new audio is referenced from `assetManifest.audio` before runtime use.
- Keep the lower-right `SOUND` / `MUTED` toggle working across scene restarts.
- Avoid introducing autoplay requirements that prevent the game from starting
  until the user interacts with the page.

### Next.js and React wrapper

- `src/app/page.tsx` should continue to render the game canvas client-side.
- `src/game/GameCanvas.tsx` owns Phaser game creation and cleanup. Flag duplicate
  Phaser instances, leaked resize listeners, or scene startup races.
- Metadata and share-image changes in `src/app/layout.tsx` must keep referenced
  public files, dimensions, and alt text aligned. In particular, verify or add
  `/opengraph-image.png` if a PR depends on that asset.

### Styling and accessibility

- This repo currently uses `src/app/globals.css`; it does not configure
  TailwindCSS. Review DOM UI changes against the existing CSS patterns rather
  than assuming Tailwind utilities are available.
- For future DOM controls, require semantic elements, keyboard access, focus
  states, and clear labels.
- Phaser canvas interactions are not normal DOM controls. Review hit-zone size,
  pointer affordances, responsive placement, and keyboard/mouse parity for those
  flows.

## What to avoid in reviews

- Do not request broad refactors unrelated to the PR.
- Do not require compatibility shims for unshipped branch-only behavior.
- Do not block on pre-existing README/runtime mismatches unless the PR touches
  the affected behavior or claims to resolve it.
- Do not ask for new dependencies when a local helper or current framework API
  handles the task.
- Do not treat asset regeneration as proof that runtime references are correct;
  inspect the manifest and load sites too.

## Pull request review checklist

Use this checklist as a starting point, scaled to the PR scope:

1. Changed files match the stated intent.
2. Build and TypeScript verification are present for code changes.
3. Runtime asset references exist and are loaded through the manifest.
4. Controls, HUD, modal, and canvas interaction changes preserve small viewport
   behavior.
5. Audio changes respect mute state and browser interaction requirements.
6. Metadata changes do not reference missing public files.
7. Documentation updates match shipped runtime behavior or clearly note known
   limitations.
8. Generated assets include enough process notes to reproduce them.
