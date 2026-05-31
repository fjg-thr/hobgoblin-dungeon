#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";

import { createNextDevCleanupRunner } from "./next-dev-clean-env-runner.mjs";

const require = createRequire(import.meta.url);
const nextBinPath = require.resolve("next/dist/bin/next");

createNextDevCleanupRunner({
  argv: process.argv.slice(2),
  consoleLike: console,
  nextBinPath,
  processLike: process,
  spawn,
  spawnSync
});
