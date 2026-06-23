# Cursor Bugbot review guidance

This repository is the Hobgoblin Ruin prototype: a Next.js App Router app
with React, TypeScript, and a Phaser 4 canvas game.

## Deployment boundary

- Cursor Bugbot is a hosted review service. Enabling it requires Cursor
  dashboard/org settings and Cursor GitHub App access to
  `fjg-thr/hobgoblin-dungeon`; repository files only provide review context.
- After this file is merged to the default branch, verify deployment with a
  real PR review smoke test. A top-level PR comment can request a manual run
  with `cursor review` or `bugbot run`.
- For troubleshooting, use `cursor review verbose=true` or
  `bugbot run verbose=true` to collect request IDs and diagnostic detail.

## Review priorities

1. Game runtime correctness in `src/game/scenes/DungeonScene.ts`.
   - Watch for regressions in tile/world coordinate conversion, pathing,
     collision boxes, projectile lifetimes, enemy respawn timing, power-up
     timers, damage invulnerability windows, score/ammo state, and restart
     cleanup.
   - Large scene edits should preserve deterministic state transitions and
     avoid orphaned Phaser objects, timers, keyboard handlers, or sounds after
     scene restart/destroy.
2. Client/server boundaries in `src/game/GameCanvas.tsx` and `src/app/*`.
   - Phaser must stay behind client-only code. Do not introduce static
     server-side imports of browser-only Phaser APIs.
   - Keep React effects idempotent under Strict Mode and ensure game instances
     are destroyed on unmount.
3. Asset loading and manifests.
   - `src/game/assets/manifest.ts` and `assetManifest` are the runtime source
     of truth for textures, atlases, sprite sheets, UI assets, and audio loaded
     by the Phaser scene.
   - When asset JSON or PNG/WAV files change under `public/assets`, verify the
     runtime manifest paths, frame names, dimensions, and animation assumptions
     still match the generated files.
   - `public/assets/audio/audio-manifest.json` is auxiliary; do not treat it as
     proof that audio is loaded unless `assetManifest.audio` is also updated.
4. Next.js and TypeScript safety.
   - Prefer `npm run build` and `npx tsc --noEmit` over `npm run lint` in this
     baseline because `next lint` is not reliable for the current Next version.
   - Restore generated `next-env.d.ts` route-type churn unless the PR is
     intentionally changing Next type generation. Keep `tsconfig.tsbuildinfo`
     untracked.
5. User-facing behavior and documentation.
   - README currently documents Space and click firing; code-defined seeker
     ammo and some power-up timing details may be ahead of README text. Treat
     those as baseline mismatches unless a PR touches controls, progression, or
     gameplay docs.
   - `src/app/layout.tsx` references `/opengraph-image.png`, but the baseline
     may not include that asset. Only block PRs that touch metadata/share image
     behavior or make the mismatch worse.

## Suggested verification for relevant PRs

- `npm ci`
- `npm run build`
- `npx tsc --noEmit`
- Asset or audio generator/processor changes may also need the specific script
  that owns the touched files, such as `tools/generate_audio_sfx.mjs`,
  `scripts/generate-retro-soundtrack.mjs`, or the matching `tools/process_*.mjs`
  or `.py` processor.

## Review style

- Prioritize bugs, security/privacy issues, runtime regressions, missing
  verification, and mismatches between changed assets/manifests/code.
- Do not block unrelated PRs only for known baseline audit advisories,
  README/code drift, missing OpenGraph image, or absence of a general test
  runner. Call those out as existing risks when relevant.
