# Cursor Bugbot Review Guide

This repository is a Next.js App Router project that boots a Phaser
4.0.0-rc.4 dungeon game from a client-only React shell. When reviewing pull
requests, prioritize issues that can break runtime gameplay, asset loading,
static metadata, or browser compatibility.

## Project-specific review priorities

- Verify Next.js server/client boundaries. Phaser, `window`, input listeners,
  audio, and canvas setup must stay behind client-only code paths.
- Check Phaser lifecycle cleanup. New scenes, timers, tweens, event handlers,
  keyboard listeners, pointer listeners, and audio objects should be destroyed
  or unregistered when the scene or React component shuts down.
- Preserve gameplay state invariants. Health, ammo, cooldowns, invulnerability
  windows, power-up durations, enemy respawn timers, and score changes should
  clamp to intended ranges and avoid duplicate application in a single frame.
- Review collision and coordinate conversions carefully. Tile-space,
  world-space, isometric projection, sprite depth, and hitbox math are common
  sources of regressions in this codebase.
- Validate asset-manifest changes. Any added asset key should match files under
  `public/assets`, sprite-sheet frame dimensions, metadata JSON, animation row
  indexes, and preload usage.
- Check static metadata assets. If OpenGraph, Twitter card, icon, or other
  public metadata references change, confirm the referenced file exists under
  `public/` and that dimensions/alt text stay consistent.
- Flag performance risks in the main update loop. Avoid per-frame allocations,
  unbounded object creation, repeated pathfinding work, or scans that scale with
  map size without throttling.
- Check browser input and accessibility around React UI. Interactive controls
  should be keyboard accessible, labeled, and safe for focus management.
- Treat generated assets and processing scripts as reproducible pipelines.
  Changes to tools should keep source paths, output dimensions, alpha handling,
  and manifest references in sync.
- Watch for package-manager drift. This repo currently has both
  `package-lock.json` and `pnpm-lock.yaml`; dependency changes should keep the
  intended lockfile strategy clear and avoid unrelated lockfile churn.

## Expected verification

- For application changes, prefer `npm run build` as the baseline verification.
- For TypeScript-only changes, also confirm `npx tsc --noEmit --incremental false`
  if build output does not clearly cover the edited paths.
- If behavior depends on assets, confirm referenced files exist and match the
  manifest dimensions used by Phaser.
- Do not rely on `npm run lint` until linting is migrated away from `next lint`;
  with the current lockfile-resolved Next.js version, that script is not a valid
  integrated lint command.

## Review style

- Focus comments on concrete bugs, regressions, security problems, or missing
  verification.
- Include the affected user-facing symptom whenever possible.
- Do not block on purely subjective style preferences unless they hide a real
  maintenance or correctness risk.
