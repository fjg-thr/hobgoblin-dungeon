# Cursor Bugbot Review Guidance

Use this guidance when reviewing changes in this repository. The project is a
Next.js App Router prototype that renders a Phaser-powered, GBA-inspired
isometric dungeon game in the browser.

## Review priorities

1. Protect client/server boundaries.
   - `src/game/**` and `src/game/GameCanvas.tsx` are browser-only code paths.
   - Phaser must stay behind dynamic/client-side imports and must not run during
     server rendering or metadata generation.
   - React components that touch browser globals need `"use client"` and must
     guard setup/cleanup through effects.

2. Check Phaser lifecycle safety.
   - `GameCanvas` should create one `Phaser.Game` per mounted host and destroy it
     during cleanup.
   - Scene code should not leak timers, input handlers, sounds, tweens, or
     GameObjects across restarts or game-over flows.
   - Resize, pointer, keyboard, and audio handlers should be removable or owned
     by Phaser systems that clean up with the scene/game.

3. Preserve gameplay correctness.
   - Movement, collision, enemy pathing, projectile hitboxes, pickup collection,
     power-up durations, score, ammo, health, and game-over transitions should be
     reviewed as user-visible behavior.
   - Time-based logic should handle Phaser delta spikes; long frames must not
     cause tunneling, repeated damage bursts, or skipped state transitions.
   - Random spawning must respect safe-distance, max-count, unlock, and blocked
     tile rules.

4. Keep asset manifest contracts intact.
   - `src/game/assets/manifest.ts` paths, keys, frame sizes, metadata paths, and
     row/frame counts must match files under `public/assets/**`.
   - When generated sprite sheets or JSON metadata change, verify the consuming
     animation code still reads the expected frame layout.
   - Do not accept references to missing assets, stale source file names, or
     untracked generated outputs.

5. Review deploy metadata and public assets.
   - `src/app/layout.tsx` metadata uses `/opengraph-image.png`; ensure it is
     backed by `public/opengraph-image.png` or by a valid App Router metadata
     image route when changed.
   - `NEXT_PUBLIC_SITE_URL` and `VERCEL_URL` handling should continue producing
     absolute metadata URLs without crashing local development.

6. Maintain TypeScript and React quality.
   - Prefer explicit types for shared gameplay shapes and public helpers.
   - Avoid broad `any`, implicit global state, stale closures, and mutation that
     crosses scene lifetime boundaries unexpectedly.
   - Keep imports precise and avoid loading heavy browser-only modules into
     server components.

## Verification commands

Run the commands that apply to the touched files:

```bash
npm ci
npm run build
npx tsc --noEmit
```

Notes:

- `npm run lint` currently maps to `next lint`, which is not available in the
  locked Next.js CLI version used by this repository. Prefer the build and
  TypeScript checks above until linting is migrated.
- Next.js or TypeScript verification can generate local artifacts such as
  `.next/`, `next-env.d.ts`, or `tsconfig.tsbuildinfo`; do not include generated
  churn unless the change intentionally requires it.

## Review output expectations

- Lead with concrete bugs, regressions, or missing verification.
- Include file and line references for each finding.
- If a concern depends on generated assets, verify the corresponding tracked
  files before reporting it.
- If no issue is found, say so and mention any meaningful test or runtime gaps
  that remain.
