# Cursor Bugbot Review Guide

This repository is a Next.js app that boots a Phaser-based dungeon game from a
client-only React shell. When reviewing pull requests, prioritize issues that
can break runtime gameplay, asset loading, or browser compatibility.

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
- Flag performance risks in the main update loop. Avoid per-frame allocations,
  unbounded object creation, repeated pathfinding work, or scans that scale with
  map size without throttling.
- Check browser input and accessibility around React UI. Interactive controls
  should be keyboard accessible, labeled, and safe for focus management.
- Treat generated assets and processing scripts as reproducible pipelines.
  Changes to tools should keep source paths, output dimensions, alpha handling,
  and manifest references in sync.

## Expected verification

- For application changes, prefer `npm run build` as the baseline verification.
- For TypeScript-only changes, also confirm `npx tsc --noEmit` if build output
  does not clearly cover the edited paths.
- If behavior depends on assets, confirm referenced files exist and match the
  manifest dimensions used by Phaser.

## Review style

- Focus comments on concrete bugs, regressions, security problems, or missing
  verification.
- Include the affected user-facing symptom whenever possible.
- Do not block on purely subjective style preferences unless they hide a real
  maintenance or correctness risk.
