# Cursor Bugbot review guidance

Use this file as repository-specific context when reviewing PRs for the Hobgoblin Ruin Prototype. These rules help Bugbot focus on regressions that matter for this Next.js + Phaser game; they do not enable the hosted Bugbot service by themselves.

## Activation and verification boundary

- Hosted Bugbot must still be enabled through Cursor dashboard/org settings and the GitHub App must have access to this repository.
- These instructions apply after they are merged to the default branch. A PR adding or changing this file may not be reviewed with the new guidance yet.
- Manual review triggers are top-level PR comments: `cursor review` or `bugbot run`. For diagnostics, use `cursor review verbose=true` or `bugbot run verbose=true` to request verbose logs/request details.
- If you cannot inspect Cursor dashboard settings, GitHub App installation state, or a live PR review result, say so explicitly. Repository files alone cannot prove managed Bugbot enablement.

## Project map

- Next app shell: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`.
- Phaser game runtime: `src/game/GameCanvas.tsx`, `src/game/scenes/DungeonScene.ts`, `src/game/maps/startingDungeon.ts`.
- Runtime asset source of truth: `src/game/assets/manifest.ts`. `public/assets/audio/audio-manifest.json` is auxiliary consistency data, not what the scene loads directly.
- Generated/source asset docs and tooling: `ASSET_PROMPTS.md`, `tools/*.py`, `tools/*.mjs`, and `scripts/generate-retro-soundtrack.mjs`.

## Review priorities

1. **Game loop and scene lifecycle:** check Phaser object creation/destruction, timers, input listeners, restart/game-over paths, and cleanup across scene restarts. Flag leaks, duplicated listeners, stale references, and objects that can be updated after destruction.
2. **Gameplay invariants:** preserve collision, player health, finite ammo, seeker ammo, projectile cooldowns, power-up durations, score, spawn pacing, and difficulty ramps. Review changes for edge cases at zero ammo/health, scene restart, pointer-outside-canvas aiming, and overlapping pickups/enemies.
3. **Asset/runtime consistency:** when a PR changes assets, manifests, frame dimensions, animation rows, or generator scripts, verify the manifest paths and frame metadata match files under `public/assets`. Broken sprite dimensions usually fail visually before TypeScript notices.
4. **Next.js integration:** keep Phaser client-only boundaries intact. Avoid importing Phaser from server components or metadata files. Check `metadataBase`, OpenGraph/Twitter image paths, and environment URL handling when metadata changes.
5. **Input and accessibility:** for DOM UI, prefer semantic elements and existing `globals.css` patterns. For Phaser overlays, review keyboard/mouse affordances, hit areas, responsive placement, and whether canvas-only controls leave users without discoverable interactions.
6. **Dependencies and tooling:** keep dependency changes minimal and justified. This repo uses Next 16-era tooling where `next lint` is not reliable; prefer build/typecheck evidence over lint-only claims.

## Known baseline context

- `src/app/layout.tsx` references `/opengraph-image.png`, but no matching app or public image exists on the current baseline. Do not block unrelated PRs solely for this; do flag metadata/share-image changes that worsen or rely on it.
- README says `Space` or `J` can shoot, but `DungeonScene.ts` currently binds keyboard shooting to `SPACE` only. Treat this as an existing docs/code mismatch unless an input-control PR touches it.
- Seeker ammo is implemented in code and unlocks after 4 kills or 30 seconds, but README primarily documents standard ammo. Review seeker changes against code behavior, not README silence.
- README describes blast as a rare late-game power-up; current code unlocks blast after 2 kills or 16 seconds. Treat that timing mismatch as existing baseline unless a PR intentionally fixes it.
- `npm ci` currently reports baseline audit findings from existing dependencies. Do not block unrelated PRs only for pre-existing audit output; do flag new dependency risk.
- Verification can dirty `next-env.d.ts` or create `tsconfig.tsbuildinfo`. These generated artifacts should not be committed unless the PR intentionally changes generated TypeScript/Next behavior.

## Expected verification

For most code PRs, expect fresh evidence from:

```bash
npm ci
npm run build
npx tsc --noEmit
```

For asset/tooling PRs, also expect targeted generator or processing commands that match the touched scripts, followed by asset-manifest checks and generated artifact cleanup. If a PR cannot run a relevant command, the review should state the gap and assess risk from the diff.
