# Cursor Bugbot review guidance

Use this file as repository-specific context when Cursor Bugbot reviews pull
requests for Hobgoblin Ruin. The managed service still has to be enabled outside
the repo: confirm the Cursor dashboard or org settings, Cursor GitHub App access
to `fjg-thr/hobgoblin-dungeon`, and a live pull-request smoke review. This file
only supplies review guidance after it is merged to the default branch, so a PR
that adds or changes this file might not be reviewed with these exact rules yet.

Manual review triggers to know:

- Comment `cursor review` or `bugbot run` on a PR to request a review.
- Use `cursor review verbose=true` or `bugbot run verbose=true` for diagnostics,
  request IDs, and log detail when a review does not appear.

## Project shape

- Next.js app router with React 19-style client components.
- Phaser 4 RC game runtime is loaded client-side from `src/game/GameCanvas.tsx`.
- Main gameplay lives in `src/game/scenes/DungeonScene.ts`; it is intentionally
  large, so review changed helpers in local context before suggesting refactors.
- Runtime asset and audio paths come from `src/game/assets/manifest.ts`.
- Global DOM styling is plain CSS in `src/app/globals.css`; Tailwind is not
  configured in this repo.

## Review priorities

1. Guard server/client boundaries. Phaser imports should remain dynamic or inside
   client-only code, and scene cleanup should destroy timers, listeners, audio,
   input handlers, tweens, and game objects introduced by a change.
2. Preserve asset contracts. When manifests, spritesheets, frame dimensions, or
   public asset paths change, verify the matching file exists and the Phaser
   loader key/path/frame data stay synchronized. `assetManifest.audio` is the
   runtime audio source of truth; `public/assets/audio/audio-manifest.json` is
   auxiliary consistency data.
3. Check gameplay invariants in `DungeonScene.ts`: health caps, finite ammo,
   seeker ammo unlocks, projectile collision/despawn, enemy respawn/pathing,
   pickup safe distance, power-up duration/unlock gating, score updates, and game
   over/restart state. Prefer targeted fixes over broad scene rewrites.
4. Review input and UI affordances carefully. Current runtime firing is Space and
   pointer/click; README also mentions J, which is a baseline mismatch unless the
   PR touches controls/docs. Canvas UI changes need pointer zones, keyboard/mouse
   affordances, responsive placement, and readable debug/HUD overlays.
5. Treat known baseline mismatches as context, not blockers for unrelated PRs:
   README omits seeker ammo, README describes blast as late rare while code gates
   it differently, `src/app/layout.tsx` references `/opengraph-image.png` without
   a matching committed image, and `next lint` is not reliable under Next 16.
6. For generated assets and audio, look for the relevant source/tooling updates:
   `tools/generate_audio_sfx.mjs`, `scripts/generate-retro-soundtrack.mjs`, and
   the `tools/process_*.mjs` / `.py` processors. Do not require regenerated
   binary assets unless the PR changes generation inputs or runtime references.

## Verification to request or run

Prefer these checks for code changes:

```bash
npm ci
npm run build
npx tsc --noEmit
```

`npm ci` may report existing audit advisories; only block if the PR introduces or
worsens dependency risk. Builds can rewrite generated `next-env.d.ts` route types
or create `tsconfig.tsbuildinfo`; those should not be committed unless the PR is
intentionally changing generated TypeScript/Next metadata.

## Review style

- Lead with concrete bugs or regressions, with file and line references.
- Separate shipped behavior from known baseline gaps.
- Ask for focused tests or manual smoke steps when runtime canvas behavior cannot
  be proven from static review alone.
