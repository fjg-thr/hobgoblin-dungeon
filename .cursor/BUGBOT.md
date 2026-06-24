# Cursor Bugbot review guidance

Use this file as repository-specific context when Cursor Bugbot reviews PRs for
the Hobgoblin Ruin prototype. Bugbot is a managed Cursor/GitHub App service; this
file only gives review instructions. Enabling the service still requires Cursor
dashboard/org settings, GitHub App repository access, or Admin API credentials.
After this file is merged to the default branch, smoke-test a real PR review.

Manual review triggers in a top-level PR comment:

- `cursor review`
- `bugbot run`
- `cursor review verbose=true` for diagnostics, request IDs, and extra logs
- `bugbot run verbose=true` for the same verbose troubleshooting path

## Repository profile

- Next.js app with React and TypeScript, running a Phaser 4 game client.
- Primary gameplay code lives in `src/game/scenes/DungeonScene.ts`.
- Phaser is loaded from `src/game/GameCanvas.tsx` inside a client component.
- Runtime asset source of truth is `src/game/assets/manifest.ts`; especially
  `assetManifest.audio` for loaded WAV files.
- `public/assets/audio/audio-manifest.json` is auxiliary consistency data, not
  the runtime audio loader source.
- Styling is plain `src/app/globals.css`; Tailwind is not configured here.

## Review priorities

1. Gameplay regressions in movement, collision, aiming, firing, ammo, pickups,
   power-ups, enemy spawning, damage, scoring, game over, restart, or debug mode.
2. Phaser lifecycle mistakes: duplicate `Phaser.Game` instances, leaked event
   handlers/timers/tweens/sounds, scene shutdown cleanup, or client/server import
   boundaries that break Next.js rendering.
3. Asset manifest drift: new files under `public/assets/**` must be registered
   in `assetManifest` when loaded at runtime, and manifest frame sizes/keys must
   match Phaser spritesheet usage.
4. Audio changes: verify mute behavior, volume bounds, missing WAV references,
   and `assetManifest.audio` updates. Keep generated audio/tooling changes
   reviewable and reproducible.
5. UI/canvas UX: verify pointer zones, keyboard and mouse affordances,
   responsive placement, semantic DOM around the canvas, and metadata changes.
6. Documentation drift only when the PR touches related behavior or docs.

## Current baseline notes

- `DungeonScene.ts` currently binds shooting to `SPACE` plus pointer/click fire.
  README also mentions `J`; treat that as existing docs drift unless the PR
  changes controls or control documentation.
- README documents standard ammo, hearts, quickshot, haste, ward, and blast.
  Code also supports seeker ammo and seeker projectiles after progression
  thresholds; review seeker changes against code behavior, not README alone.
- README describes blast as late and rare, while `POWERUP_CONFIG` controls actual
  unlock timing and weight. Do not block unrelated PRs solely on that mismatch.
- `src/app/layout.tsx` references `/opengraph-image.png`; if the asset is absent
  on the branch, treat it as baseline unless metadata/share-image behavior is in
  scope or worsened.
- `npm ci` may report existing audit advisories. Do not block unrelated PRs only
  for the current Next.js/PostCSS audit baseline, but flag new dependency risk.
- `next lint` is not reliable with the current Next version. Prefer the commands
  below for scoped verification.

## Asset and generator review

- Procedural SFX generator: `tools/generate_audio_sfx.mjs`.
- Retro soundtrack generator: `scripts/generate-retro-soundtrack.mjs`.
- Asset processors live under `tools/` and should keep generated sprite sheets,
  JSON metadata, frame dimensions, and manifest keys aligned.
- Avoid approving changes that update generated assets without either updating
  the corresponding generator/source notes or making clear that the asset was
  intentionally hand-authored.

## Suggested verification

Run the most relevant subset for the PR:

```bash
npm ci
npm run build
npx tsc --noEmit
```

For asset/tooling PRs, also run the exact touched generator or processor, for
example:

```bash
node tools/generate_audio_sfx.mjs
node scripts/generate-retro-soundtrack.mjs
python3 tools/process_assets.py
node tools/process_actor_death_assets.mjs
node tools/process_combat_juice_assets.mjs
```

If Next.js rewrites `next-env.d.ts` or produces `tsconfig.tsbuildinfo` during
verification, do not include those generated artifacts unless the PR explicitly
changes Next type generation behavior.

## Review style

- Lead with concrete regressions and missing verification, with file/line
  references.
- Separate existing baseline issues from problems introduced by the PR.
- For visual/gameplay changes, request a smoke test in the browser when automated
  coverage cannot prove the behavior.
- Keep comments focused and actionable; do not request broad rewrites when a
  narrow fix or test would address the risk.
