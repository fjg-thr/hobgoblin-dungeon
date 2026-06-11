# Cursor Bugbot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add repository-side Cursor Bugbot review guidance so Bugbot can review pull requests with project-specific context after the hosted integration is enabled.

**Architecture:** Use Cursor's managed Bugbot service rather than a custom GitHub Actions reviewer. Store all repository-specific review instructions in `.cursor/BUGBOT.md` and document the external dashboard dependency in the design note.

**Tech Stack:** Cursor Bugbot repository rules, Markdown documentation, Next.js build verification.

---

### Task 1: Add Bugbot Review Rules

**Files:**
- Create: `.cursor/BUGBOT.md`

- [x] **Step 1: Create the rules file**

```markdown
# Bugbot Review Instructions

Review pull requests for this repository as a production-focused reviewer. Prioritize findings that would change runtime behavior, break the build, lose player state, create inaccessible UI, or make assets fail to load. Avoid low-value style comments unless they hide a real bug.

## Project Context

- This is a Next.js app that hosts a Phaser-based isometric dungeon game.
- TypeScript is strict and runs with `noEmit`; type regressions should be treated as build failures.
- Game behavior is concentrated in `src/game/scenes/DungeonScene.ts`, map generation in `src/game/maps`, and asset references in `src/game/assets/manifest.ts`.
- Generated and processed assets live under `public/assets`; review code and metadata changes, but do not nitpick generated binary or sprite-sheet content.

## What To Flag

- Broken asset references: manifest entries, JSON frame names, or public paths that no longer match checked-in files.
- Phaser lifecycle bugs: duplicate listeners, timers, tweens, animations, or scene resources that are not cleaned up across restarts.
- Game-state regressions: stale mutable state, counters that do not reset on restart, enemy/projectile arrays that can desynchronize, or score/health/ammo changes that can go negative unexpectedly.
- Coordinate and collision mistakes: mismatched world/screen/isometric coordinates, incorrect tile bounds, or changes that let actors pass through walls.
- React/Next integration issues: browser-only APIs used during server render, missing client boundaries, hydration hazards, or metadata/config changes that break production builds.
- Accessibility regressions in UI controls, overlays, buttons, and keyboard interactions.
- Security or reliability issues in scripts that process files, especially unsafe path handling or assumptions that can overwrite unintended files.

## What To Avoid

- Do not request broad refactors unrelated to the changed lines.
- Do not flag intentionally simple prototype mechanics just because a larger game architecture could exist.
- Do not require new dependencies when the existing standard library, Next.js, React, or Phaser APIs are sufficient.
- Do not comment on generated image or audio quality unless a code or manifest change makes the asset unusable.

## Review Style

- Keep findings actionable and tied to a concrete failure mode.
- Prefer a small number of high-confidence comments over exhaustive speculation.
- Include the user-visible impact and a minimal fix direction when possible.
```

- [x] **Step 2: Verify the rules are ASCII Markdown**

Run: `python3 - <<'PY'\nfrom pathlib import Path\nPath(".cursor/BUGBOT.md").read_text(encoding="ascii")\nprint("BUGBOT.md is ASCII")\nPY`

Expected: `BUGBOT.md is ASCII`

### Task 2: Document Deployment Boundary

**Files:**
- Create: `docs/superpowers/specs/2026-06-11-cursor-bugbot-design.md`

- [x] **Step 1: Record the selected deployment approach**

```markdown
# Cursor Bugbot Deployment Design

## Purpose

Enable Cursor Bugbot to review pull requests for this repository with guidance that matches the codebase. The repository cannot install the hosted Cursor GitHub integration by itself, so this change provides the durable repo-side configuration Bugbot reads after the repository is enabled in Cursor.
```

- [x] **Step 2: Document verification**

```markdown
## Testing

Because the implementation is repository configuration and documentation, verification is limited to checking that the new files are present, committed, and do not affect the application build. Run `npm run build` after committing the configuration.
```

### Task 3: Commit, Push, and Verify

**Files:**
- Modify: git index only

- [x] **Step 1: Stage and commit the configuration**

Run:

```bash
git add .cursor/BUGBOT.md docs/superpowers/specs/2026-06-11-cursor-bugbot-design.md docs/superpowers/plans/2026-06-11-cursor-bugbot.md
git commit -m "chore: add cursor bugbot review rules"
```

Expected: commit succeeds on branch `cursor/cursor-bugbot-deployment-31bf`.

- [x] **Step 2: Push the branch**

Run: `git push -u origin cursor/cursor-bugbot-deployment-31bf`

Expected: push succeeds.

- [x] **Step 3: Run build verification**

Run: `npm run build`

Expected: Next.js build succeeds.
