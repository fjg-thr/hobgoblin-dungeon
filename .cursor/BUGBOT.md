# Cursor Bugbot Review Guide

Use this guide when reviewing this repository with Cursor Bugbot. Repository files provide review context only; confirm managed Bugbot enablement through Cursor dashboard/org settings, Cursor GitHub App repository access, optional Admin API configuration, and a live PR smoke review after this file is merged to the default branch.

## Trigger and service checks

- Manual PR smoke triggers: add a top-level GitHub PR comment `cursor review` or `bugbot run`. Use `cursor review verbose=true` or `bugbot run verbose=true` only when diagnostics, request IDs, or service logs are needed.
- New or changed instructions in this file may not affect the same PR until merged to the default branch.
- If Bugbot does not respond, review repository access for the Cursor GitHub App and organization/project Bugbot settings before changing app code.

## Review priorities

- Next.js app shell: `src/app/page.tsx`, `src/app/layout.tsx`, and `src/game/GameCanvas.tsx` should keep Phaser client-only. Watch dynamic `import("phaser")`, Strict Mode double-mount behavior, canvas resize, and `game.destroy(true)` cleanup.
- Phaser runtime: `src/game/scenes/DungeonScene.ts` is the main gameplay surface. Scrutinize scene shutdown/restart cleanup for input handlers, resize listeners, tweens, delayed calls, looping audio, generated textures, and `localStorage` mute state.
- Map generation: changes in `src/game/maps/startingDungeon.ts` must preserve reachable rooms, safe player/enemy starts, chasm/bridge/stair placement, tile blocking, and prop blockers.
- Assets: `src/game/assets/manifest.ts` is the runtime source of truth. Match every changed asset path, frame size, frame count, row layout, and animation range against the corresponding checked-in `public/assets/**/*.png` and sidecar JSON.
- Generated files: when sprite/audio outputs change, check the relevant generator or processor in `tools/` or `scripts/` and keep README/asset provenance aligned. Do not assume all tools are portable; some source-image inputs may be local or ignored.
- UI and accessibility: this repo does not currently use Tailwind or shadcn. For DOM changes, follow existing semantic HTML and `src/app/globals.css`; for Phaser UI, verify pointer zones, keyboard/mouse affordances, responsive placement, and canvas-specific UX.

## Known baseline context

- README says `Space` or `J` fires, while current code binds keyboard firing to `Space` plus pointer/click firing. Flag this on input/docs PRs, but do not block unrelated PRs solely for the existing mismatch.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast. Code also includes seeker ammo/projectiles unlocked by progression thresholds; treat seeker behavior as code-defined unless a docs PR intentionally updates it.
- README describes blast as rare late-game; code unlocks blast through `POWERUP_CONFIG`. Treat existing wording drift as baseline unless a change touches power-up progression.
- `public/assets/audio/audio-manifest.json` is auxiliary. Runtime audio loading comes from `assetManifest.audio`.
- `next lint` is not reliable with the current Next version. Prefer build and TypeScript checks.

## Verification commands

Use the narrowest relevant checks for the PR. Typical repository-level checks:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

Asset-specific checks, only when related files change:

```bash
npm run process:assets
npm run process:death-assets
npm run process:combat-juice
npm run generate:powerups
npm run generate:combat-assets
node tools/process_pickup_intent_effect_assets.mjs
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
```

If verification rewrites `next-env.d.ts` or creates `tsconfig.tsbuildinfo` without an intentional Next typing change, restore/clean those generated artifacts before merge.
