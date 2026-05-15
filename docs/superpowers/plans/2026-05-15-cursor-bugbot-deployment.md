# Cursor Bugbot Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add repository-side automation that requests Cursor Bugbot reviews on pull requests.

**Architecture:** A GitHub Actions workflow listens for pull request lifecycle events and comments `bugbot run` without checking out or executing pull request code. The README documents that Cursor Bugbot must also be enabled in the Cursor dashboard/GitHub App for the comment to have an effect.

**Tech Stack:** GitHub Actions, `actions/github-script@v7`, Markdown documentation.

---

## File Structure

- Create `.github/workflows/cursor-bugbot-review.yml`: PR automation that posts one Bugbot trigger comment per PR head SHA.
- Modify `README.md`: Adds a short operational note explaining the Cursor dashboard prerequisite and workflow behavior.

### Task 1: Add Bugbot trigger workflow

**Files:**
- Create: `.github/workflows/cursor-bugbot-review.yml`

- [ ] **Step 1: Create the workflow file**

Write this exact content:

```yaml
name: Cursor Bugbot Review

on:
  pull_request_target:
    types:
      - opened
      - reopened
      - ready_for_review
      - synchronize

permissions:
  contents: read
  issues: write
  pull-requests: read

jobs:
  request-bugbot-review:
    name: Request Bugbot review
    if: ${{ !github.event.pull_request.draft && github.event.pull_request.user.type != 'Bot' }}
    runs-on: ubuntu-latest
    steps:
      - name: Comment Bugbot trigger
        uses: actions/github-script@v7
        with:
          script: |
            const marker = '<!-- cursor-bugbot-review -->';
            const pullRequest = context.payload.pull_request;
            const { owner, repo } = context.repo;
            const issue_number = pullRequest.number;
            const headSha = pullRequest.head.sha;
            const shaMarker = `${marker} ${headSha}`;

            const comments = await github.paginate(github.rest.issues.listComments, {
              owner,
              repo,
              issue_number,
              per_page: 100,
            });

            const alreadyRequested = comments.some((comment) => (
              comment.user?.login === 'github-actions[bot]' &&
              comment.body?.includes(shaMarker)
            ));

            if (alreadyRequested) {
              core.info(`Bugbot review was already requested for ${headSha}.`);
              return;
            }

            await github.rest.issues.createComment({
              owner,
              repo,
              issue_number,
              body: [
                shaMarker,
                'bugbot run',
                '',
                `Cursor Bugbot review requested for \`${headSha}\`.`,
                '',
                '_Cursor Bugbot must be enabled for this repository in the Cursor dashboard._',
              ].join('\n'),
            });
```

- [ ] **Step 2: Validate workflow YAML parses**

Run:

```bash
python3 -c "import pathlib, yaml; yaml.safe_load(pathlib.Path('.github/workflows/cursor-bugbot-review.yml').read_text()); print('workflow yaml ok')"
```

Expected output:

```text
workflow yaml ok
```

### Task 2: Document Bugbot deployment behavior

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add deployment documentation**

Insert this section after the run instructions:

```markdown
## Cursor Bugbot Reviews

Pull requests are configured to request a Cursor Bugbot review through `.github/workflows/cursor-bugbot-review.yml`. The workflow posts a `bugbot run` comment for each non-draft, human-authored PR head SHA without checking out or executing PR code.

Cursor Bugbot must also be enabled for this repository in the Cursor dashboard and connected GitHub App settings. Without that external setup, the workflow comment is harmless but will not start a Bugbot review.
```

- [ ] **Step 2: Run the project build**

Run:

```bash
npm run build
```

Expected result: Next.js build exits with code 0.

### Task 3: Commit and push implementation

**Files:**
- Stage: `.github/workflows/cursor-bugbot-review.yml`
- Stage: `README.md`
- Stage: `docs/superpowers/plans/2026-05-15-cursor-bugbot-deployment.md`

- [ ] **Step 1: Review git status**

Run:

```bash
git status --short
```

Expected changed files are the workflow, README, and this plan.

- [ ] **Step 2: Commit**

Run:

```bash
git add .github/workflows/cursor-bugbot-review.yml README.md docs/superpowers/plans/2026-05-15-cursor-bugbot-deployment.md
git commit -m "Deploy Cursor Bugbot review workflow"
```

- [ ] **Step 3: Push**

Run:

```bash
git push -u origin cursor/cursor-bugbot-deployment-0619
```
