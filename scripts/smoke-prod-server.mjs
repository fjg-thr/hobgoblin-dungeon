#!/usr/bin/env node

import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

import { getAvailablePort, stopProcessGroup, waitForHttpOk } from "./smoke-dev-server.mjs";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_START_TIMEOUT_MS = 30_000;
const DEFAULT_SHUTDOWN_TIMEOUT_MS = 10_000;

const createDefaultArgs = ({ host, port }) => [
  "exec",
  "next",
  "start",
  "--",
  "--hostname",
  host,
  "--port",
  String(port)
];

export const runProductionSmoke = async ({
  command = "npm",
  createArgs = createDefaultArgs,
  host = DEFAULT_HOST,
  port,
  shutdownTimeoutMs = DEFAULT_SHUTDOWN_TIMEOUT_MS,
  startTimeoutMs = DEFAULT_START_TIMEOUT_MS
} = {}) => {
  const prodPort = port ?? (await getAvailablePort(host));
  const url = `http://${host}:${prodPort}/`;
  const prodServer = spawn(command, createArgs({ host, port: prodPort }), {
    detached: true,
    stdio: "inherit"
  });

  let result;
  let startupError;

  try {
    result = await Promise.race([
      waitForHttpOk(url, { timeoutMs: startTimeoutMs }),
      once(prodServer, "error").then(([error]) => {
        throw error;
      }),
      once(prodServer, "exit").then(([code, signal]) => {
        throw new Error(`Production server exited before ${url} responded (code=${code}, signal=${signal}).`);
      })
    ]);

    console.log(`Production server responded with HTTP ${result.status}; bytes=${result.bytes}`);
  } catch (error) {
    startupError = error;
  } finally {
    await stopProcessGroup(prodServer, {
      signal: "SIGTERM",
      timeoutMs: shutdownTimeoutMs
    });
  }

  if (startupError) {
    throw startupError;
  }

  return result;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runProductionSmoke().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
