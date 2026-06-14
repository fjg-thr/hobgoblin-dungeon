# Cursor Bugbot Review Instructions

## Project context

This repository is a first-playable web prototype for a dark GBA-inspired isometric dungeon game. It uses Next.js App Router, React, strict TypeScript, and Phaser 4 for the runtime game scene.

The Phaser game code intentionally carries prototype complexity, especially around dungeon generation, collision, combat, enemy pressure, powerups, scoring, audio, and debug rendering. Review comments should prioritize concrete behavioral bugs over broad architecture preferences.

This file supplies repository review guidance only. Enabling Bugbot still requires Cursor dashboard, GitHub App, or Cursor Admin API configuration outside this repository.

## Review priorities

Flag issues that can break gameplay, rendering, deployment, or future iteration:

- React/Phaser lifecycle bugs, especially duplicate Phaser game instances, leaked event listeners, timers, tweens, sounds, or scene resources after component unmounts.
- TypeScript or Next.js build problems, including client/server boundary mistakes around Phaser imports.
- Asset-loading regressions: incorrect `public/assets/...` paths, stale manifest entries, missing JSON frame data, frame-size mismatches, or renamed files not reflected in `src/game/assets/manifest.ts`.
- Gameplay regressions in movement, isometric coordinate math, collision, camera follow, finite ammo, powerups, hearts, scoring, enemy spawning, projectile cleanup, and game-over/restart state.
- Performance issues that are likely to affect browser playability, such as unbounded object creation in per-frame `update` loops or missed cleanup for offscreen projectiles/effects/enemies.
- Accessibility or usability regressions in the Next.js shell around starting, restarting, muting audio, or exposing controls.

## Keep review noise low

Do not block on style-only preferences or broad refactors unless they are tied to a concrete bug or maintenance hazard in the changed code.

The following are known prototype trade-offs:

- Collision uses simple tile/proximity checks rather than full physics.
- The staircase is visible but does not transition to another level yet.
- Generated pixel-art assets are first-pass and may be replaced in later milestones.
- Some gameplay systems are concentrated in larger Phaser scene files for now.
- There is no automated test suite in this prototype yet.

## Validation expectations

For code changes, expect these commands to be run when practical:

```bash
npm run build
npx tsc --noEmit
```

If a change only updates documentation or Cursor configuration, a syntax/readability check of the changed files is sufficient.

Use npm as the canonical package manager for review recommendations because the README documents `npm install` and `npm run dev`. Avoid suggesting package-manager churn unless the PR is explicitly standardizing tooling.

## Asset pipeline guidance

When reviewing changes under `public/assets/`, `tools/`, or `scripts/`:

- Confirm generated spritesheets still match their paired JSON frame metadata.
- Confirm chroma-key processing preserves transparent backgrounds and nearest-neighbor pixel art.
- Confirm new runtime assets are referenced from the asset manifest and loaded before use.
- Watch for accidental source-asset bloat or committing transient generated files that are not part of the documented asset set.

## Security and runtime safety

Flag committed secrets, environment files, or generated files that include API keys. Avoid recommending client-side access to secrets; this is a browser game and client-bundled values are public.
