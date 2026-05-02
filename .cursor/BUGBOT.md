# Bugbot Review Instructions

Review this repository as a Next.js application that embeds a Phaser game prototype.
Prioritize issues that can affect runtime behavior, player input, asset loading, or
production builds.

## High-priority review areas

- Flag TypeScript errors, unsafe casts, or unchecked nullable values that can break
  scene setup, input handlers, timers, tweens, or animation callbacks.
- Check that Phaser objects, event listeners, timers, and tweens are cleaned up when
  scenes restart or components unmount.
- Verify asset keys, frame names, manifest entries, and public asset paths stay in
  sync when sprite sheets, audio, or generated metadata change.
- Watch for browser-only APIs used during server rendering. Game code should remain
  behind client-side boundaries.
- Call out gameplay regressions in movement, aiming, enemy spawning, collision,
  scoring, health, ammo, powerups, start flow, game-over flow, and mute behavior.
- Treat build, lint, and type-check failures as blocking review findings.

## Project conventions

- Prefer small, focused changes that match existing Phaser scene patterns.
- Keep generated asset metadata deterministic and avoid unrelated asset churn.
- Use descriptive handler names with a `handle` prefix in React-facing code.
- Preserve accessibility for DOM controls, including labels and keyboard support.
- Avoid introducing custom CSS when Tailwind utilities or existing global styles
  are sufficient.

## Validation suggestions

When relevant, recommend running:

```bash
npm run build
npx tsc --noEmit
```

If reviewing gameplay changes, also recommend a manual browser smoke test covering
start, movement, combat, pickups, mute toggle, restart, and game-over behavior.
