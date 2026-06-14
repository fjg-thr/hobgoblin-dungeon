# Cursor Bugbot Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare the repository for Cursor Bugbot code review with repo-local rules and deployment guidance.

**Architecture:** Cursor Bugbot is enabled outside the repository through Cursor/GitHub integration, while this repository supplies review instructions and contributor workflow documentation. The implementation adds small markdown/config files only; no runtime source code or GitHub Actions workflow is required.

**Tech Stack:** Markdown, GitHub pull request templates, Cursor Bugbot repo rules.

---

## File structure

- Create `.cursor/BUGBOT.md`: root Bugbot rules automatically included in reviews.
- Create `docs/cursor-bugbot.md`: deployment checklist for repository administrators and contributors.
- Create `.github/pull_request_template.md`: pull request checklist with manual Bugbot trigger guidance.

## Task 1: Add Cursor Bugbot review rules

**Files:**
- Create: `.cursor/BUGBOT.md`

- [ ] **Step 1: Add root Bugbot rules**

Create `.cursor/BUGBOT.md` with:

```markdown
# Cursor Bugbot Review Rules

## Review priorities

- Prioritize correctness, regressions, security, data loss, broken builds, and missing test coverage for changed behavior.
- Flag issues that could break the Next.js app lifecycle, Phaser scene lifecycle, asset loading, or browser input handling.
- Treat runtime errors during start screen, gameplay, game over, or audio mute flows as high priority.
- Verify asset manifest updates stay consistent with files under `public/assets`.
- Check that generated asset or audio changes keep source scripts and committed outputs in sync.
- Do not leave style-only comments unless the style issue hides a correctness, maintainability, accessibility, or performance problem.

## Project-specific expectations

- For React and Next.js changes, verify client-only Phaser code remains behind client component boundaries and does not access browser globals during server rendering.
- For Phaser changes, look for leaked timers, event listeners, tweens, sounds, or scene objects across restarts and scene transitions.
- For gameplay changes, review collision, spawn, scoring, health, ammo, power-up, and difficulty-ramp interactions together rather than in isolation.
- For input changes, verify keyboard, mouse, click-to-fire, mute, restart, and modal controls remain usable and do not conflict.
- For asset pipeline changes, confirm scripts in `tools/` or `scripts/` still produce metadata that matches the consuming TypeScript code.

## Comment style

- Prefer concise, actionable comments with a concrete failure scenario or reproduction path.
- Include file and symbol context when possible.
- Avoid speculative rewrites when a smaller targeted fix would address the issue.
```

- [ ] **Step 2: Verify rules file exists**

Run:

```bash
test -f .cursor/BUGBOT.md && sed -n '1,20p' .cursor/BUGBOT.md
```

Expected: command exits `0` and prints the heading plus review priorities.

## Task 2: Document Bugbot deployment process

**Files:**
- Create: `docs/cursor-bugbot.md`

- [ ] **Step 1: Add deployment documentation**

Create `docs/cursor-bugbot.md` with:

```markdown
# Cursor Bugbot Deployment

This repository includes Cursor Bugbot review rules in `.cursor/BUGBOT.md`.
Those rules improve review quality, but they do not install or enable Bugbot by themselves.

## Enable Bugbot for this repository

1. In Cursor, open the team dashboard.
2. Connect GitHub from the Cursor integrations settings if it is not already connected.
3. Install or update the Cursor GitHub App for this repository.
4. Open the Bugbot settings in Cursor.
5. Enable Bugbot for this repository.
6. Choose the desired run mode:
   - automatic review on each pull request update,
   - manual review only when mentioned, or
   - one review per pull request.

These steps require Cursor team admin and GitHub repository or organization admin access.

## Manual review triggers

If Bugbot is configured for manual runs, comment one of the following on a pull request:

```text
cursor review
```

or:

```text
bugbot run
```

## Repository rules

Bugbot reads the root `.cursor/BUGBOT.md` file for repository-level instructions.
Nested `.cursor/BUGBOT.md` files can be added later if specific subtrees need specialized review rules.

## Troubleshooting

- If Bugbot does not respond, verify that the Cursor GitHub App has access to this repository.
- If Bugbot responds but skips reviews, check the repository run mode in Cursor Bugbot settings.
- If Bugbot comments are too broad or too narrow, update `.cursor/BUGBOT.md` with more specific review priorities.
```

- [ ] **Step 2: Verify documentation mentions external enablement and manual triggers**

Run:

```bash
rg "Cursor GitHub App|cursor review|bugbot run" docs/cursor-bugbot.md
```

Expected: all three phrases are found.

## Task 3: Add pull request checklist guidance

**Files:**
- Create: `.github/pull_request_template.md`

- [ ] **Step 1: Add PR template**

Create `.github/pull_request_template.md` with:

```markdown
## Summary

- Describe the change.

## Verification

- [ ] Build/lint/tests run, or reason documented:
- [ ] Cursor Bugbot reviewed this PR automatically, or manual review was requested with `cursor review` / `bugbot run`.
```

- [ ] **Step 2: Verify PR template exists**

Run:

```bash
test -f .github/pull_request_template.md && rg "Cursor Bugbot|cursor review|bugbot run" .github/pull_request_template.md
```

Expected: command exits `0` and prints the Bugbot checklist line.

## Task 4: Final validation and commit

**Files:**
- Verify: `.cursor/BUGBOT.md`
- Verify: `docs/cursor-bugbot.md`
- Verify: `.github/pull_request_template.md`

- [ ] **Step 1: Review git diff**

Run:

```bash
git diff -- .cursor/BUGBOT.md docs/cursor-bugbot.md .github/pull_request_template.md docs/superpowers/specs/2026-06-14-cursor-bugbot-deployment-design.md docs/superpowers/plans/2026-06-14-cursor-bugbot-deployment.md
```

Expected: only the intended Bugbot rules, deployment documentation, PR template, spec, and plan files are shown.

- [ ] **Step 2: Commit and push implementation**

Run:

```bash
git add .cursor/BUGBOT.md docs/cursor-bugbot.md .github/pull_request_template.md docs/superpowers/specs/2026-06-14-cursor-bugbot-deployment-design.md docs/superpowers/plans/2026-06-14-cursor-bugbot-deployment.md
git commit -m "Configure Cursor Bugbot review guidance"
git push -u origin cursor/cursor-bugbot-deployment-5e3f
```

Expected: commit succeeds and push updates the feature branch.

## Self-review

- Spec coverage: all spec artifacts are represented in Tasks 1-3, with validation and commit in Task 4.
- Placeholder scan: the plan contains no TBD/TODO placeholders; checklist blanks in the PR template are intentional for pull request authors.
- Type consistency: no executable types or function signatures are introduced.
