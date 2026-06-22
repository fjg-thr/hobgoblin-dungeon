# Cursor Bugbot review guide

This repository is a Next.js + React shell that boots a Phaser dungeon prototype from `src/game/GameCanvas.tsx` and `src/game/scenes/DungeonScene.ts`. Review changes as a playable browser game first, then as a small Next app.

## Deployment boundary

This file supplies repository-specific review context for Cursor Bugbot after it is merged to the default branch. It does not prove that the hosted Bugbot service is enabled. To confirm deployment, verify Cursor dashboard/org Bugbot settings, GitHub App access to `fjg-thr/hobgoblin-dungeon`, and a smoke review on a PR. Manual diagnostics can be requested with a top-level PR comment such as `cursor review`, `bugbot run`, `cursor review verbose=true`, or `bugbot run verbose=true`.

## Review priorities

- Gameplay code lives mostly in `src/game/scenes/DungeonScene.ts`; prefer focused changes and watch for regressions in movement, collision, aim/fire, spawn pacing, pickups, hit stop, audio, start/game-over overlays, and resize behavior.
- Runtime assets are loaded from `src/game/assets/manifest.ts`. When assets are added, renamed, or regenerated, ensure manifest paths, public files, sprite-sheet frame sizes, and metadata JSON stay consistent.
- Audio runtime source of truth is `assetManifest.audio`. `public/assets/audio/audio-manifest.json` is auxiliary and should not be treated as the loader source.
- Procedural asset tooling includes `tools/process_assets.py`, `tools/generate_audio_sfx.mjs`, `tools/process_*`, `tools/generate_*`, and `scripts/generate-retro-soundtrack.mjs`. Review generated/public asset churn carefully and require an explanation when binary assets change.
- The app uses plain CSS in `src/app/globals.css`; Tailwind/ShadCN are not configured. For DOM changes, follow existing semantic markup and CSS patterns. For Phaser UI, review pointer zones, keyboard/mouse affordances, responsive placement, and canvas-specific accessibility limits.
- Metadata in `src/app/layout.tsx` references `/opengraph-image.png`. This branch currently has no matching `public/opengraph-image.png` or `src/app/opengraph-image.*`; treat that as a known baseline unless metadata/share-image behavior is being changed.

## Known baseline mismatches

Do not block unrelated PRs solely for these existing mismatches, but flag changes that worsen them or touch the same behavior:

- README says `Space` or `J` fires, while current gameplay binds keyboard shooting to `SPACE`; pointer/click firing also works.
- README documents standard ammo, hearts, quickshot, haste, ward, and blast, but not seeker ammo. Current code unlocks seeker ammo after 4 kills or 30 seconds and supports seeker pickups/projectiles.
- README calls blast a rare late-game power-up, while current `POWERUP_CONFIG.blast` unlocks after 2 kills or 16 seconds.
- Dependency audit warnings may appear during install/build verification. Do not block scoped gameplay/config PRs solely on existing advisories unless dependencies are changed.

## Verification commands

For most code PRs, ask for the narrowest relevant verification plus:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`next lint` is not reliable with the current Next toolchain. Build/typecheck may rewrite `next-env.d.ts` or create `tsconfig.tsbuildinfo`; those generated artifacts should stay out of unrelated PRs.

