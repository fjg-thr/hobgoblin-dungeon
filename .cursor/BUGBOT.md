# Cursor Bugbot review guidelines

Review this Next.js and Phaser game prototype with emphasis on runtime regressions that may not be caught by static checks.

## High-priority review areas

- Flag code that touches browser-only APIs outside client-only boundaries or Phaser scene lifecycle methods.
- Check that Phaser objects, timers, input handlers, and event listeners are cleaned up when scenes shut down or React components unmount.
- Verify asset manifest changes match files under `public/assets` and that sprite-sheet frame dimensions/names stay consistent with runtime usage.
- For gameplay changes, look for state updates that can desynchronize health, ammo, score, enemy spawning, pickups, or power-up timers.
- Call out collision, camera, scaling, and pointer-aiming changes that may behave differently across screen sizes.
- For procedural map changes, check edge cases around room placement, corridor carving, spawn safety, and blocked paths.
- For UI changes, verify keyboard accessibility and readable contrast while preserving the pixel-art presentation.

## Project-specific expectations

- Prefer small, localized changes that follow existing scene and asset-management patterns.
- Avoid introducing server-side dependencies for gameplay code unless they are explicitly needed.
- Treat build, type-check, and asset-loading failures as blocking issues.
