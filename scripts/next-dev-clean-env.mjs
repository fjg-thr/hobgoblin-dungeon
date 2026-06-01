#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBinPath = require.resolve("next/dist/bin/next");

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
