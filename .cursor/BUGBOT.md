# Bugbot Review Rules

Use these project-specific checks when reviewing pull requests for Hobgoblin Ruin Prototype.

## Review priorities

- Prioritize bugs that can break gameplay, scene startup, asset loading, input handling, audio state, collision, enemy spawning, scoring, or run reset behavior.
- Treat Next.js client/server boundary issues as high risk. Phaser code must stay behind client-only boundaries and must not access browser globals during server rendering.
- Check Phaser scene lifecycle changes for leaked timers, event listeners, tweens, sounds, graphics objects, or physics bodies when restarting or destroying scenes.
- Validate asset manifest changes against files in `public/assets` and flag mismatches in frame names, paths, dimensions, or animation keys.
- Review TypeScript changes for unsafe casts, nullable state assumptions, and code paths that can run before assets or scene objects are initialized.
- Watch for gameplay tuning changes that can create unwinnable states, runaway enemy counts, impossible pickup rates, or frame-rate dependent behavior.
- Prefer small, localized fixes that preserve the current prototype architecture unless a broader refactor is necessary to prevent a real bug.

## Testing expectations

- For code changes, expect `npm run build` to pass.
- If linting is available and compatible with the installed Next.js version, expect `npm run lint` to pass.
- For gameplay changes, mention any important manual browser checks that are still needed, especially start screen flow, movement, combat, pickups, mute toggle, death/restart, and debug overlay.
