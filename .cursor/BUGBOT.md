# Cursor Bugbot review guide

Use this file as repo-specific context when reviewing pull requests for the
Hobgoblin Ruin prototype. Managed Bugbot enablement is controlled by Cursor
dashboard/org settings and the GitHub App installation, not by repository files.
After this guide is merged to the default branch, confirm deployment with:

- Cursor dashboard/org settings show Bugbot enabled for this repository.
- The Cursor GitHub App has access to `fjg-thr/hobgoblin-dungeon`.
- A PR smoke check works from a top-level comment: `cursor review` or
  `bugbot run`. Use `cursor review verbose=true` or
  `bugbot run verbose=true` when troubleshooting.

PRs that add or edit this file might not be reviewed with the new guidance until
the file is present on the default branch.

## Project map

- Next.js App Router entry points: `src/app/layout.tsx`, `src/app/page.tsx`,
  and global DOM styles in `src/app/globals.css`.
- React owns mounting/unmounting through `src/game/GameCanvas.tsx`.
- Phaser gameplay is concentrated in `src/game/scenes/DungeonScene.ts`.
- Map generation and collision helpers live in `src/game/maps/startingDungeon.ts`.
- Runtime asset loading uses `src/game/assets/manifest.ts`.
- Generated and processed asset tooling lives in `tools/` and `scripts/`.
- Public sprites, metadata, and audio live under `public/assets/`.

## Review priorities

1. **Phaser/React lifecycle**
   - Check that Phaser games, scenes, input handlers, timers, tweens, sounds,
     and DOM listeners are cleaned up when React unmounts or scenes restart.
   - Avoid patterns that create duplicate canvases, duplicate listeners, or
     stale scene references across Next Fast Refresh.

2. **Gameplay correctness**
   - Verify movement, aiming, collision, enemy AI, projectiles, powerups,
     pickups, scoring, health, death, restart, debug overlay, and audio toggles
     against the changed code.
   - Prefer deterministic helpers for map/collision changes where practical.
   - Treat existing README/code mismatches as baseline unless a PR touches them:
     README mentions `J` firing, but current runtime firing is `Space` plus
     pointer/click; README also describes blast as late rare while code unlocks
     blast earlier. Code also includes seeker ammo behavior not fully documented
     in README.

3. **Assets and manifests**
   - `assetManifest` is the runtime source of truth. If PNG, JSON, WAV, or asset
     keys change, verify the manifest, preload code, animation frame sizes,
     frame counts, and public file paths stay aligned.
   - `public/assets/audio/audio-manifest.json` is auxiliary consistency data;
     do not assume it drives runtime loading.
   - Generated artifacts should not churn unless the PR intentionally updates
     assets. Ask for generator commands or source prompt changes when outputs
     change without explanation.

4. **Next/TypeScript/UI surface**
   - This repo does not currently use Tailwind or shadcn/ui. For DOM UI, prefer
     semantic elements and existing `globals.css` patterns.
   - Review Phaser canvas UI separately: pointer hit zones, keyboard affordance,
     responsive placement, readable labels, and audio/mute state.
   - Watch for server/client boundary mistakes in App Router files. Phaser code
     must stay client-only.

5. **Dependencies and verification**
   - Keep dependency hardening separate from ordinary game/asset changes unless
     the PR explicitly scopes it.
   - `next lint` is not reliable with the current Next version. Prefer:
     `npm run build`, `npx tsc --noEmit`, and targeted runtime smoke checks.
   - `npm ci` may report existing audit findings; do not block unrelated PRs
     solely on baseline advisories unless dependencies changed.
   - Build/typecheck can rewrite `next-env.d.ts` and create
     `tsconfig.tsbuildinfo`; these should not remain in the diff unless
     intentionally changed.

## Review output

Lead with concrete bugs or regressions, ordered by severity, with file/line
references and user-visible impact. If no blocking issues are found, say so and
name any verification gaps, especially missing browser/gameplay smoke coverage.
