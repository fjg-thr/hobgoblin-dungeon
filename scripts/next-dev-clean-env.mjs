#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const nextBinPath = require.resolve("next/dist/bin/next");
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const nextEnvPath = join(repoRoot, "next-env.d.ts");
const productionNextEnv = `/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
`;

const signalExitCodes = new Map([
  ["SIGINT", 130],
  ["SIGTERM", 143]
]);

let restoredRouteTypes = false;

const restoreRouteTypes = () => {
  if (restoredRouteTypes) {
    return;
  }

  restoredRouteTypes = true;
  writeFileSync(nextEnvPath, productionNextEnv);

  const result = spawnSync(process.execPath, [nextBinPath, "typegen"], {
    stdio: "ignore"
  });

  if (result.status !== 0) {
    console.error("Warning: failed to restore production Next route types after dev server shutdown.");
  }
};

const devServer = spawn(process.execPath, [nextBinPath, "dev", ...process.argv.slice(2)], {
  stdio: "inherit"
});

const forwardSignal = (signal) => {
  if (!devServer.killed) {
    devServer.kill(signal);
  }
};

const shutdown = (signal) => {
  forwardSignal(signal);
  restoreRouteTypes();
  process.exit(signalExitCodes.get(signal) ?? 1);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

devServer.on("exit", (code, signal) => {
  restoreRouteTypes();

  if (signal) {
    process.exit(signalExitCodes.get(signal) ?? 1);
  }

  process.exit(code ?? 0);
});
