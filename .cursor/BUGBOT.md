# Cursor Bugbot review guidance

Use this file as repository-specific context for Cursor Bugbot reviews after it is
merged to the default branch. Enabling the hosted Bugbot service still happens
outside this repository through Cursor dashboard/org settings, GitHub App
repository access, or the Bugbot Admin API. A change to this file can provide
review instructions, but it cannot prove that managed Bugbot is enabled; confirm
with a live PR review or manual top-level PR comment such as `cursor review` or
`bugbot run` when service access is available. For troubleshooting, request
verbose diagnostics with `cursor review verbose=true` or
`bugbot run verbose=true`.

## Project snapshot

- Next.js/React/TypeScript app with a Phaser dungeon prototype.
- Main gameplay lives in `src/game/scenes/DungeonScene.ts`; the React shell is
  `src/game/GameCanvas.tsx`.
- Runtime assets are loaded from `src/game/assets/manifest.ts`; its
  `assetManifest.audio` section is the source of truth for audio loaded by the
  scene. `public/assets/audio/audio-manifest.json` is an auxiliary consistency
  file.
- Asset/audio generation and processing are split across `tools/` and
  `scripts/`, including `tools/generate_audio_sfx.mjs`,
  `tools/generate_powerup_sprites.mjs`, `tools/process_actor_death_assets.mjs`,
  `tools/process_combat_juice_assets.mjs`, and
  `scripts/generate-retro-soundtrack.mjs`.

## Review priorities

- Gameplay changes: inspect dungeon generation, collision/proximity checks,
  enemy spawning, progression gates, scoring, ammo, pickups, power-ups, and
  cleanup of Phaser timers/listeners/objects between runs.
- Controls: current runtime firing is `Space` plus pointer/click firing. The
  README also mentions `J`; treat that as a known docs/runtime mismatch unless a
  PR touches controls or documentation.
- Power-ups/docs: quickshot, haste, ward, blast, hearts, ammo, and code-defined
  seeker ammo have existing README/code mismatches. Block only changes that make
  touched behavior or documentation less accurate.
- Assets/audio: when manifests change, verify file paths exist under `public/`,
  frame sizes match Phaser spritesheets, generated metadata stays aligned, and
  audio keys referenced by `DungeonScene.ts` match `assetManifest.audio`.
- UI/accessibility: this repo does not use Tailwind. For DOM UI, follow existing
  semantic HTML and `src/app/globals.css` patterns. For Phaser UI, review pointer
  zones, keyboard/mouse affordances, canvas scaling, and responsive placement.
- Metadata: `src/app/layout.tsx` references `/opengraph-image.png`, but this
  branch has no matching `public/opengraph-image.png`; treat that as a known
  baseline unless a PR touches metadata/share-image behavior or makes it worse.

## Suggested verification

- Run `npm run build`.
- Run `npx tsc --noEmit`.
- Do not rely on `npm run lint`; current Next.js versions no longer provide the
  legacy `next lint` command consistently in this repo.
- If verification rewrites generated files such as `next-env.d.ts` or
  `tsconfig.tsbuildinfo`, make sure the final diff contains only intentional
  changes.

## Review style

Prioritize concrete regressions, missing verification, and user-visible
behavior. Call out baseline mismatches as context, but do not block unrelated PRs
solely for existing README/code drift, dependency audit warnings, or managed
Bugbot service settings that are not visible from repository files.
