# Cursor Bugbot review guidance

This repo is a dark GBA-style isometric dungeon prototype built with Next.js App
Router, React, TypeScript, and Phaser 4 RC. Use this file as repository-specific
review context after it is merged to the default branch.

## Deployment boundary

- Managed Bugbot enablement is outside this repo: verify Cursor dashboard/org
  settings, GitHub App repository access, and a live PR review smoke check when
  those controls are available.
- Repository changes can only provide review guidance. They cannot prove that the
  hosted Bugbot service is enabled.
- Manual review triggers may be requested with a top-level PR comment such as
  `cursor review` or `bugbot run`; use `verbose=true` only for diagnostics.

## Project map

- `src/app/`: Next.js app shell, metadata, global CSS, and the game host page.
- `src/game/GameCanvas.tsx`: client-only Phaser boot and lifecycle cleanup.
- `src/game/scenes/DungeonScene.ts`: main gameplay loop, enemies, combat,
  pickups, HUD, audio, input, and Phaser object management.
- `src/game/maps/startingDungeon.ts`: procedural dungeon layout, tile codes,
  props, collision affordances, and spawn-safe positions.
- `src/game/assets/manifest.ts`: runtime asset source of truth. Keep new runtime
  asset keys and paths here before loading them in scenes.
- `tools/` and `scripts/`: asset/audio generators and processors for local
  pixel-art, chroma-key, combat, pickup, and procedural audio assets.

## Review priorities

- Preserve Phaser lifecycle safety: dynamically import Phaser only on the client,
  destroy the game on React unmount, and unregister scene input/listener hooks on
  shutdown.
- Review gameplay changes for frame-rate-independent timing, projectile cleanup,
  enemy/pickup array removal, hitbox/collision edge cases, and power-up/ammo
  state consistency.
- Preserve pixel-art rendering (`pixelArt`, `roundPixels`, no antialiasing) and
  responsive full-window resize behavior in `GameCanvas.tsx`.
- Keep runtime assets registered in `assetManifest`; when changing generated
  assets, ensure the matching generator/processor command and JSON metadata stay
  consistent.
- For UI/metadata changes, use semantic HTML where applicable and follow existing
  `src/app/globals.css` patterns. This repo does not currently use Tailwind.
- Treat Phaser canvas overlays as interactive game UI: check pointer zones,
  keyboard/mouse affordances, HUD placement, and mobile/responsive limitations.

## Known baseline context

Do not block unrelated PRs solely for these existing prototype limitations or
doc/code mismatches:

- Collision is intentionally simple tile/proximity logic, not a full physics
  engine.
- The staircase is visible but does not transition to another level.
- Each run creates a fresh procedural dungeon; combat, enemy AI, lighting, and
  procedural WAV audio are intentionally first-pass.
- `src/app/layout.tsx` references `/opengraph-image.png`, but no matching file is
  present on the current baseline. Only flag changes that touch metadata/share
  images or worsen this.
- README says `Space` or `J` fires, while current code binds keyboard shooting to
  `SPACE` and also supports pointer/click firing. Scope this to input or docs PRs.
- Current code includes seeker ammo after progression gates, but README does not
  document seeker ammo yet.
- README calls blast a rare late-game power-up; current config unlocks blast
  after 2 kills or 16 seconds. Scope this to balancing or docs PRs.
- `public/assets/audio/audio-manifest.json` is auxiliary. Runtime audio loading
  uses `assetManifest.audio`.

## Verification expectations

- For TypeScript/React/gameplay changes, prefer `npm run build` and
  `npx tsc --noEmit`. `npm run lint` maps to `next lint` and may not be reliable
  with the current Next version/configuration.
- For asset edits, run the specific changed generator/processor, such as
  `npm run process:assets`, `npm run process:death-assets`,
  `npm run process:combat-juice`, `npm run generate:powerups`,
  `npm run generate:combat-assets`, or the directly edited script under
  `tools/`/`scripts/`.
- If `next-env.d.ts` or `tsconfig.tsbuildinfo` changes only because of local
  build/typecheck output, restore or clean those generated artifacts unless the
  PR intentionally changes Next typing behavior.
- Current dependency audits may report baseline advisories. Do not block a
  scoped, unrelated PR solely for pre-existing audit findings.

## Review output

Prioritize concrete bugs, regressions, missing verification, and user-visible
risks. Tie findings to exact files/lines and distinguish prototype limitations
from regressions introduced by the PR under review.
