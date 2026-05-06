# Cursor Bugbot review guidelines

Review this repository as a browser-based game prototype built with Next.js,
React, TypeScript, and Phaser.

Prioritize findings that would cause player-visible bugs, runtime crashes, or
regressions in pull requests. Avoid commenting on cosmetic preferences unless
they hide a functional issue.

## Project-specific focus areas

- **Next.js client boundaries:** Phaser code must only run on the client. Watch
  for browser-only APIs being imported or executed during server rendering.
- **React lifecycle:** Effects that create Phaser games, timers, listeners, or
  async work must clean up safely and avoid duplicate game instances.
- **Phaser scene state:** Verify that sprites, tweens, input handlers, sounds,
  and scene events are destroyed or stopped when scenes restart or unmount.
- **Gameplay invariants:** Review collision, health, ammo, scoring, enemy spawn,
  and power-up changes for edge cases that can soft-lock runs or create
  impossible states.
- **Asset manifests:** Ensure asset keys, JSON frame names, paths, and generated
  files stay consistent with `public/assets/**` and `src/game/assets/manifest.ts`.
- **Performance:** Flag per-frame allocations, unbounded loops, excessive path
  recalculation, and leaked objects in `update` paths.
- **Accessibility/UI:** UI outside the Phaser canvas should remain keyboard and
  screen-reader accessible.

## Review style

- Prefer concise inline comments on changed lines.
- Call out only actionable bugs, security risks, broken builds, or missing tests
  for risky behavior.
- Include reproduction hints when a problem depends on a specific game state.
