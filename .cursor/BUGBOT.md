# Cursor Bugbot Review Guidance

Review this repository as a Next.js App Router game prototype that embeds a Phaser scene in React. Prioritize runtime/gameplay regressions, asset manifest drift, generated-artifact churn, and build/type-safety issues over style-only feedback.

## Repository shape

- App entry points live in `src/app/`; the game host is `src/game/GameCanvas.tsx`.
- Main gameplay logic is concentrated in `src/game/scenes/DungeonScene.ts`.
- Map data and helpers live in `src/game/maps/startingDungeon.ts`.
- Runtime asset registration is in `src/game/assets/manifest.ts`.
- Asset metadata is under `public/assets/**`; image/audio generation and processing utilities live under both `tools/` and `scripts/`.
- Global styling is plain CSS in `src/app/globals.css`; this repo does not currently use Tailwind.

## High-priority review checks

1. **Client-only boundaries**
   - Phaser and browser globals must remain behind client boundaries.
   - `GameCanvas.tsx` should avoid server-side access to `window`, `document`, WebAudio, or Phaser constructors.
   - App Router files should preserve required metadata and not accidentally convert broad server components to client components.

2. **Gameplay invariants**
   - Movement, aiming, firing, enemy damage, ammo, pickups, scoring, game-over, restart, mute, and debug controls should continue to work together.
   - Timer/event cleanup matters. Watch for Phaser timers, tweens, input handlers, DOM listeners, and sound instances that can survive scene shutdown or React remounts.
   - Collision or pathing changes should be checked against generated dungeon rooms, corridors, props, stairs, and enemy spawn constraints.

3. **Assets and manifests**
   - Any new runtime asset must have a matching file under `public/assets/**`, a JSON frame/manifest entry when applicable, and a registration path in `src/game/assets/manifest.ts`.
   - Generated images, sprite sheets, audio, and JSON should not be reformatted or regenerated unless the PR is intentionally changing assets.
   - Avoid committing local build artifacts such as `.next/`, `tsconfig.tsbuildinfo`, or generated route-type output.

4. **UI and accessibility**
   - Keep keyboard and pointer access for start, how-to-play, close, mute, and restart interactions.
   - Preserve readable contrast and scalable layout behavior in the existing CSS patterns.
   - Phaser interactive zones should have clear visual affordances and keyboard equivalents where the surrounding UI supports them.

5. **Dependency and tooling risk**
   - Be suspicious of lockfile churn, framework version drift, or dependency additions unrelated to the user-facing change.
   - This project intentionally has no committed CI workflow. Do not request GitHub Actions changes unless the PR is explicitly about CI/tooling.

## Suggested verification

Ask for or run the smallest set that matches the change:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check origin/main...HEAD
```

For gameplay changes, also smoke-test locally with `npm run dev` and verify:

- Start screen opens the game.
- WASD/arrow movement works.
- Mouse aim plus click firing works.
- `Space` firing works.
- Ammo pickups reload shots.
- Hearts and powerups still apply their effects.
- Mute and restart controls respond.

`next lint` is not reliable in this repo's current Next version because the script still calls the removed `next lint` command.

## Known baseline mismatches

Do not block unrelated PRs solely for these existing issues, but flag PRs that touch the affected area and make the mismatch worse:

- README says `Space` or `J` fires; current gameplay uses `Space` plus pointer/click firing.
- README documents regular ammo, hearts, quickshot, haste, ward, and blast, while code also includes seeker ammo behavior.
- README describes blast as rare late-game, while current code unlocks it earlier through gameplay thresholds.

## Managed Bugbot boundary

This file provides repository-specific review instructions for Cursor Bugbot. It does not by itself prove that the managed Bugbot service is enabled. Confirm managed deployment through Cursor dashboard/project settings, GitHub App repository access, and a PR review smoke check when that access is available.
