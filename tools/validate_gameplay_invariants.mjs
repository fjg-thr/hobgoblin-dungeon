import { readFileSync } from "node:fs";
import { join } from "node:path";

const scenePath = join(process.cwd(), "src/game/scenes/DungeonScene.ts");
const sceneSource = readFileSync(scenePath, "utf8");
const startGameSection = sceneSource.match(/private startGame\(\)[\s\S]*?private showGameOver/)?.[0] ?? "";
const restartGameSection = sceneSource.match(/private restartGame\(\)[\s\S]*?private clearProjectiles/)?.[0] ?? "";

const checks = [
  {
    name: "run start invulnerability duration is defined",
    passes: /const RUN_START_INVULN_MS = \d+;/.test(sceneSource)
  },
  {
    name: "new games grant start invulnerability",
    passes: /this\.playerInvulnerableUntilMs = this\.time\.now \+ RUN_START_INVULN_MS;/.test(startGameSection)
  },
  {
    name: "restarted games grant start invulnerability",
    passes: /this\.playerInvulnerableUntilMs = this\.time\.now \+ RUN_START_INVULN_MS;/.test(restartGameSection)
  }
];

const failedChecks = checks.filter((check) => !check.passes);

if (failedChecks.length > 0) {
  console.error("Gameplay invariant validation failed:");
  for (const check of failedChecks) {
    console.error(`- ${check.name}`);
  }
  process.exit(1);
}

console.log(`Validated ${checks.length} gameplay invariant(s).`);
