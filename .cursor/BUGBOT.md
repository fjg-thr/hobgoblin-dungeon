# Cursor Bugbot Review Guidance

Use this file as repository-specific context when reviewing pull requests for the Hobgoblin Ruin prototype.

## Project context

- This is a private Next.js app using React, TypeScript, and Phaser for a client-only isometric dungeon prototype.
- The main game logic is in `src/game/scenes/DungeonScene.ts`; Next app entry points live under `src/app`.
- Assets under `public/assets` are loaded by Phaser through manifests such as `src/game/assets/manifest.ts`.
- Asset generator and processor tooling lives in both `tools/` and `scripts/`; generated binaries should not change unless the PR intentionally updates assets.

## Review priorities

1. **Client-only Phaser boundaries**
   - Ensure Phaser code stays behind client components or browser-only dynamic imports.
   - Watch for direct `window`, `document`, input, audio, canvas, or Phaser access during server rendering.
   - Check that scene lifecycle changes clean up timers, tweens, listeners, pooled objects, and audio state.

2. **Gameplay invariants**
   - Preserve collision, tile/world coordinate conversion, camera follow, HUD layering, and enemy/projectile depth ordering.
   - Treat ammo, health, seeker ammo, power-up duration, invulnerability, and game-over state as state-machine-sensitive.
   - For combat changes, verify projectile cleanup, enemy damage/death paths, score updates, pickup drops, and hit-stop behavior.

3. **Assets and metadata**
   - Confirm any new asset key is present in the manifest and that referenced files exist under `public/assets`.
   - Check generated image/audio changes for matching source, manifest, and preload updates.
   - If metadata or Open Graph references change, verify the referenced public files are tracked.

4. **App UI and accessibility**
   - This repo does not currently use Tailwind or ShadCN; follow existing semantic React and `src/app/globals.css` patterns.
   - Keep keyboard and pointer controls coherent between README, start/how-to-play UI, and the actual Phaser key bindings.

5. **Dependencies and tooling**
   - Avoid dependency, lockfile, or package-manager churn unless the PR explicitly needs it.
   - The package has both npm and pnpm lockfiles; keep lockfile changes intentional and explain package-manager scope.

## Known baseline mismatches

Do not block unrelated PRs solely for these existing mismatches, but flag them when a PR touches nearby controls, docs, or gameplay systems:

- README says `Space` or `J` fires; current `DungeonScene` binds shooting to `SPACE`, while pointer/click firing is also implemented.
- README describes regular ammo, heart pickups, quickshot, haste, ward, and blast. The current code also supports seeker ammo after 4 kills or 30 seconds.
- README describes blast as rare late-game; current `POWERUP_CONFIG.blast` unlocks after 2 kills or 16 seconds.

## Suggested verification

Prefer the smallest verification set that matches the PR scope. For broad or gameplay-affecting changes, ask for:

```bash
npm ci
npm run build
npx tsc --noEmit
git diff --check origin/main...HEAD
```

For asset or manifest changes, also check representative tracked files, for example:

```bash
git ls-files --error-unmatch public/assets/path/to/asset.png
```

`npm run lint` maps to `next lint`, which may not be reliable with the current Next version; prefer build plus TypeScript unless the PR updates lint tooling.

## Managed Bugbot deployment boundary

This file provides repository-side guidance for Cursor Bugbot reviews. It does not prove that the managed Cursor Bugbot service is enabled. Verify service deployment through Cursor dashboard or organization settings, GitHub App repository access, or a pull-request smoke check showing Bugbot review activity.
