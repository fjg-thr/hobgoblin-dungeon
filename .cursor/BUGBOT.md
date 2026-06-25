# Cursor Bugbot Review Guide

This file gives Cursor Bugbot repository-specific review context after it is merged to the default branch. It does not enable the managed Bugbot service by itself; confirm repository access in Cursor dashboard/org settings, the GitHub App installation, and any Admin API/service credentials outside this repo. To smoke-test a live PR review, comment `cursor review` or `bugbot run` on a PR. Use `cursor review verbose=true` or `bugbot run verbose=true` only when diagnostic request IDs or extra logs are needed.

## Review priorities

- Treat this as a Next.js, React, TypeScript, and Phaser 4 prototype. Preserve simple playable behavior over broad rewrites.
- Focus gameplay changes on `src/game/scenes/DungeonScene.ts`, including movement, collision, combat, pickups, power-ups, scoring, game-over flow, event cleanup, and scene restart behavior.
- Review React/Phaser lifecycle boundaries in `src/game/GameCanvas.tsx`: dynamic imports, one canvas per mount, teardown on unmount, and stable sizing.
- Use `src/game/assets/manifest.ts` as the runtime asset source of truth. `public/assets/audio/audio-manifest.json` is auxiliary consistency data.
- For map changes, check `src/game/maps/startingDungeon.ts` for deterministic structure, collision alignment, reachable rooms, and camera/player spawn assumptions.
- For app shell or metadata changes, check semantic HTML and existing `src/app/globals.css` patterns. This repo does not currently use Tailwind or shadcn.

## Known baseline drift

Do not block unrelated PRs solely for these existing mismatches, but do flag changes that make them worse or claim to fix them without doing so:

- README says firing uses `Space` or `J`; current gameplay binds keyboard firing to `SPACE` only, plus pointer/click firing.
- README omits seeker ammo, while the game code includes seeker pickups/projectiles after progression thresholds.
- README describes blast as a rare late-game power-up; current `POWERUP_CONFIG` unlocks blast earlier through kill/time gates.
- `src/app/layout.tsx` may reference `/opengraph-image.png`. Treat a missing generated/share image as baseline unless a PR touches metadata or social preview behavior.
- Prototype limitations in README, such as simple collision, no staircase transition, and first-pass art/audio, are intentional scope unless a PR claims to address them.
- Existing dependency audit advisories are baseline noise unless a PR changes dependency or lockfile behavior.

## Verification expectations

Prefer these scoped checks when reviewing code changes:

```bash
npm ci
npm run build
npx tsc --noEmit --incremental false
```

`npm run lint` currently invokes `next lint`, which is not reliable for this Next version until ESLint is configured. If Next or TypeScript verification dirties generated files such as `next-env.d.ts` or `tsconfig.tsbuildinfo`, require committing only intentional generated changes.

There is no automated gameplay test suite. For gameplay PRs, ask for manual repro notes covering keyboard movement, mouse aim/click fire, Space fire, pickups, damage, mute toggle, restart, and F3 debug overlay when relevant.

## Assets and generated files

- Asset PRs should keep manifests, JSON frame metadata, and `public/assets/**` paths in sync.
- Run only the specific generator or processor related to the changed asset, such as `tools/process_assets.py`, `tools/process_actor_death_assets.mjs`, `tools/process_combat_juice_assets.mjs`, `tools/generate_powerup_sprites.mjs`, `tools/generate_brute_ammo_sprites.mjs`, or `scripts/generate-retro-soundtrack.mjs`.
- Large binary sprite/audio diffs are normal; review manifest consistency, dimensions, transparency, looping, and loading behavior instead of style-nitting PNG bytes.
- Both `package-lock.json` and `pnpm-lock.yaml` exist. If dependencies change, flag PRs that update only one lockfile without explanation.

## Review style

Lead with concrete bugs, regressions, missing verification, and user-visible risks. Include exact files and reproduction steps where possible. Avoid blocking on broad architecture preferences, unrequested polish, or known prototype limitations.
