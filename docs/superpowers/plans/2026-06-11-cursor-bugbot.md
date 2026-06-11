# Cursor Bugbot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add repository-side Cursor Bugbot review guidance and CI verification so Bugbot can review pull requests with project-specific context after the hosted integration is enabled.

**Architecture:** Use Cursor's managed Bugbot service rather than a custom GitHub Actions reviewer. Store project-specific review instructions in `.cursor/BUGBOT.md`, document the external dashboard/default-branch dependency, and add CI checks that provide repeatable evidence for dependency health, type generation, build, smoke tests, and generated-file stability.

**Tech Stack:** Cursor Bugbot repository rules, GitHub Actions, Next.js 16, React 19, TypeScript, npm, pnpm, Node.js smoke helpers.

---

### Task 1: Add Bugbot Review Rules and Documentation

**Files:**
- Create: `.cursor/BUGBOT.md`
- Modify: `README.md`
- Create: `docs/superpowers/specs/2026-06-11-cursor-bugbot-design.md`
- Create: `docs/superpowers/plans/2026-06-11-cursor-bugbot.md`

- [x] **Step 1: Add project-specific Bugbot rules**

`/.cursor/BUGBOT.md` must describe:

- The managed-service boundary and external Cursor dashboard/GitHub App dependency.
- The audited deployment baseline and pinned dependency expectations.
- The project map for Next.js, Phaser, assets, and tooling.
- Review priorities for browser/runtime safety, gameplay invariants, controls/UI, assets, maintainability, docs, and CI.
- Verification evidence Bugbot should request for relevant changes.

- [x] **Step 2: Add README contributor pointer**

`README.md` must include a `Code Review` section that points to `.cursor/BUGBOT.md`, summarizes the CI baseline, and notes that managed Bugbot activation happens outside the repository.

- [x] **Step 3: Verify Markdown is ASCII**

Run: `python3 - <<'PY'\nfrom pathlib import Path\nPath(".cursor/BUGBOT.md").read_text(encoding="ascii")\nprint("BUGBOT.md is ASCII")\nPY`

Expected: `BUGBOT.md is ASCII`

### Task 2: Add CI and Smoke Verification Baseline

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `scripts/next-dev-clean-env.mjs`
- Create: `scripts/smoke-dev-server.mjs`
- Create: `scripts/smoke-dev-server.test.mjs`
- Create: `scripts/smoke-prod-server.mjs`
- Create: `scripts/smoke-prod-server.test.mjs`
- Modify: `.gitignore`
- Modify: `next-env.d.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `pnpm-lock.yaml`
- Create: `pnpm-workspace.yaml`

- [x] **Step 1: Add CI workflow**

`.github/workflows/ci.yml` must run on pull requests, `main`, and `cursor/**` branches with steps for whitespace, OpenGraph asset tracking, npm install/audit, smoke helper tests, typecheck, build, dev/prod smoke, pnpm install/audit, and generated-file stability.

- [x] **Step 2: Add dynamic-port smoke helpers**

Add dev and prod smoke scripts that select available ports, require exact HTTP 200, and cleanly stop spawned process groups. Add Node test coverage for success, child-exit, and shutdown behavior.

- [x] **Step 3: Stabilize Next route types**

Replace `next dev` with `scripts/next-dev-clean-env.mjs`, add `typecheck` as `next typegen && tsc --noEmit`, keep `next-env.d.ts` on production route types, and ignore `tsconfig.tsbuildinfo`.

- [x] **Step 4: Pin audited dependencies for npm and pnpm**

Pin Next.js, React, React DOM, TypeScript, and type packages in `package.json`; add `overrides.postcss`; declare `packageManager: pnpm@11.3.0`; add `pnpm-workspace.yaml` with the matching override and `allowBuilds.sharp: true`; update both lockfiles.

### Task 3: Commit, Push, and Verify

**Files:**
- Modify: git index only

- [x] **Step 1: Stage and commit the deployment stack**

Run:

```bash
git add .cursor/BUGBOT.md .github/workflows/ci.yml .gitignore README.md next-env.d.ts package.json package-lock.json pnpm-lock.yaml pnpm-workspace.yaml scripts/next-dev-clean-env.mjs scripts/smoke-dev-server.mjs scripts/smoke-dev-server.test.mjs scripts/smoke-prod-server.mjs scripts/smoke-prod-server.test.mjs docs/superpowers/specs/2026-06-11-cursor-bugbot-design.md docs/superpowers/plans/2026-06-11-cursor-bugbot.md
git commit -m "chore: deploy cursor bugbot review baseline"
```

Expected: commit succeeds on branch `cursor/cursor-bugbot-deployment-31bf`.

- [x] **Step 2: Push the branch**

Run: `git push -u origin cursor/cursor-bugbot-deployment-31bf`

Expected: push succeeds.

- [x] **Step 3: Run deployment verification**

Run:

```bash
git diff --check "$(git merge-base HEAD origin/main)"..HEAD
test -f public/opengraph-image.png && git ls-files --error-unmatch public/opengraph-image.png
npm ci
npm audit --omit=dev
npm run test:smoke
npm run typecheck
npm run build
npm run smoke:dev
npm run smoke:prod
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm audit --prod
git diff --exit-code -- next-env.d.ts package-lock.json pnpm-lock.yaml pnpm-workspace.yaml
```

Expected: all commands exit 0 and the working tree is clean.
