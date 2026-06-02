import { readFileSync } from "node:fs";
import { join } from "node:path";

const scenePath = join(process.cwd(), "src/game/scenes/DungeonScene.ts");
const sceneSource = readFileSync(scenePath, "utf8");
const stopPropagationCallCount = (sceneSource.match(/stopUiPointerEvent\(event\)/g) ?? []).length;
const aimPointerDownSection = sceneSource.match(/private handleAimPointerDown[\s\S]*?private resolveShotVector/)?.[0] ?? "";
const howToPlayBlockerSection = sceneSource.match(/const blocker = this\.add\.zone[\s\S]*?const overlay = this\.add\.graphics\(\);/)?.[0] ?? "";

const checks = [
  {
    name: "scene-level aim input receives game object hits",
    passes: /handleAimPointerDown\(\s*pointer:\s*Phaser\.Input\.Pointer,\s*gameObjects:\s*Phaser\.GameObjects\.GameObject\[\]/.test(sceneSource)
  },
  {
    name: "scene-level aim input does not blanket-ignore game object hits",
    passes: !/if\s*\(\s*gameObjects\.length\s*>\s*0\s*\)\s*{\s*return;\s*}/.test(aimPointerDownSection)
  },
  {
    name: "scene-level start input receives game object hits",
    passes:
      /handleStartPointerDown\(\s*pointer:\s*Phaser\.Input\.Pointer,\s*gameObjects:\s*Phaser\.GameObjects\.GameObject\[\]/.test(sceneSource)
  },
  {
    name: "scene-level game-over input receives game object hits",
    passes:
      /handleGameOverPointerDown\(\s*pointer:\s*Phaser\.Input\.Pointer,\s*gameObjects:\s*Phaser\.GameObjects\.GameObject\[\]/.test(sceneSource)
  },
  {
    name: "how-to-play back hit zone shares panel button coordinates",
    passes: /const closeZone = this\.add\.zone\(closeButton\.x,\s*closeButton\.y,\s*closeButton\.displayWidth,\s*closeButton\.displayHeight\)/.test(sceneSource)
  },
  {
    name: "how-to-play blocker closes when pointer is inside back bounds",
    passes:
      /closeHowToPlayButtonBounds[\s\S]*?Phaser\.Geom\.Rectangle\.Contains\(this\.closeHowToPlayButtonBounds,\s*pointer\.x,\s*pointer\.y\)[\s\S]*?this\.hideHowToPlayModal\(\)/.test(howToPlayBlockerSection)
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
