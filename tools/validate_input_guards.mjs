import { readFileSync } from "node:fs";
import { join } from "node:path";

const scenePath = join(process.cwd(), "src/game/scenes/DungeonScene.ts");
const sceneSource = readFileSync(scenePath, "utf8");
const stopPropagationCallCount = (sceneSource.match(/stopUiPointerEvent\(event\)/g) ?? []).length;

const checks = [
  {
    name: "scene-level aim input receives game object hits",
    passes: /handleAimPointerDown\(\s*pointer:\s*Phaser\.Input\.Pointer,\s*gameObjects:\s*Phaser\.GameObjects\.GameObject\[\]/.test(sceneSource)
  },
  {
    name: "scene-level aim input ignores UI game object hits",
    passes: /if\s*\(\s*gameObjects\.length\s*>\s*0\s*\)\s*{\s*return;\s*}/s.test(sceneSource)
  },
  {
    name: "all interactive UI pointer callbacks stop propagation",
    passes: stopPropagationCallCount >= 6
  },
  {
    name: "restartGame ignores duplicate restart calls",
    passes: /private restartGame\(\)\s*{\s*if\s*\(\s*!this\.gameOver\s*\)\s*{\s*return;\s*}/s.test(sceneSource)
  }
];

const failedChecks = checks.filter((check) => !check.passes);

if (failedChecks.length > 0) {
  console.error("Input guard validation failed:");
  for (const check of failedChecks) {
    console.error(`- ${check.name}`);
  }
  process.exit(1);
}

console.log(`Validated ${checks.length} input guard invariant(s).`);
