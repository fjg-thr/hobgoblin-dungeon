# Cursor Bugbot Deployment

Cursor Bugbot is enabled through Cursor's GitHub integration, not through a repository GitHub Actions workflow. This repository includes `.cursor/BUGBOT.md` so Bugbot has project-specific review guidance once it is enabled for the repo.

## Enable Bugbot for this repository

1. In Cursor, open the team dashboard.
2. Go to **Integrations** and connect or manage the GitHub integration.
3. Install the Cursor GitHub App for this repository, or select all repositories if that is the team's preferred scope.
4. Go to **Bugbot** in the Cursor dashboard.
5. Enable Bugbot for this repository.

After Bugbot is enabled, it can review pull requests automatically according to the dashboard settings. It can also be triggered manually from a pull request comment with:

```text
cursor review
```

or:

```text
bugbot run
```

For more diagnostic output, use:

```text
cursor review verbose=true
```

or:

```text
bugbot run verbose=true
```

## Repo-side review guidance

Bugbot reads `.cursor/BUGBOT.md` for repository-specific instructions. Keep that file focused on durable review priorities for this Next.js and Phaser game prototype:

- Build and TypeScript strict-mode failures.
- Server/client boundary mistakes around Phaser and browser APIs.
- Phaser lifecycle leaks.
- Gameplay regressions in movement, collision, combat, pickups, UI, audio, restart, and game-over flow.
- Asset manifest drift between `src/game/assets/manifest.ts` and `public/assets`.
- Main-loop performance risks.

Do not add a `.github/workflows` file just to run Bugbot; Cursor manages Bugbot outside the repo.
