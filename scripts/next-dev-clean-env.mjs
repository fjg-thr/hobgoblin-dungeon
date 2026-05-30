#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";

import { shutdownSignalExitCodes, shutdownSignals } from "./next-dev-clean-env-signals.mjs";

const require = createRequire(import.meta.url);
const nextBinPath = require.resolve("next/dist/bin/next");

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

shutdownSignals.forEach((signal) => {
  process.on(signal, () => forwardSignal(signal));
});

devServer.on("exit", (code, signal) => {
  restoreRouteTypes();

  if (signal) {
    process.exit(shutdownSignalExitCodes.get(signal) ?? 1);
  }

  process.exit(code ?? 0);
});
