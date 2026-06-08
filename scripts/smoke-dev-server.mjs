#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_START_TIMEOUT_MS = 30_000;
const DEFAULT_SHUTDOWN_TIMEOUT_MS = 10_000;
const DEFAULT_CLEAN_TIMEOUT_MS = 10_000;
const DEFAULT_INTERVAL_MS = 1_000;
const DEFAULT_REQUEST_TIMEOUT_MS = 2_000;

export const getAvailablePort = (host = DEFAULT_HOST) =>
  new Promise((resolve, reject) => {
    const server = createServer();

    server.once("error", reject);
    server.listen(0, host, () => {
      const address = server.address();

      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        if (!address || typeof address === "string") {
          reject(new Error("Unable to determine an available TCP port."));
          return;
        }

        resolve(address.port);
      });
    });
  });

export const waitForHttpOk = async (
  url,
  {
    intervalMs = DEFAULT_INTERVAL_MS,
    requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
    timeoutMs = DEFAULT_START_TIMEOUT_MS
  } = {}
) => {
  const deadline = Date.now() + timeoutMs;
  let lastError;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(requestTimeoutMs)
      });
      const body = await response.arrayBuffer();

      if (response.status === 200) {
        return {
          bytes: body.byteLength,
          status: response.status
        };
      }

      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await delay(Math.min(intervalMs, Math.max(deadline - Date.now(), 0)));
  }

  throw new Error(
    `Timed out waiting for ${url} to return HTTP 200${lastError ? `: ${lastError.message}` : ""}`
  );
};

const isProcessGroupAlive = (pgid) => {
  try {
    process.kill(-pgid, 0);
    return true;
  } catch (error) {
    if (error.code === "ESRCH") {
      return false;
    }

    throw error;
  }
};

const waitForProcessGroupExit = async (
  pgid,
  { intervalMs = 100, timeoutMs = DEFAULT_SHUTDOWN_TIMEOUT_MS } = {}
) => {
  const deadline = Date.now() + timeoutMs;

  while (isProcessGroupAlive(pgid)) {
    if (Date.now() >= deadline) {
      throw new Error(`Timed out waiting for process group ${pgid} to exit.`);
    }

    await delay(Math.min(intervalMs, Math.max(deadline - Date.now(), 0)));
  }
};

const waitForChildExit = async (child) => {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  await once(child, "exit");
};

export const stopProcessGroup = async (
  child,
  { signal = "SIGINT", timeoutMs = DEFAULT_SHUTDOWN_TIMEOUT_MS } = {}
) => {
  if (!child.pid) {
    return;
  }

  if (isProcessGroupAlive(child.pid)) {
    process.kill(-child.pid, signal);
  }

  await Promise.race([waitForChildExit(child), delay(timeoutMs)]);
  await waitForProcessGroupExit(child.pid, { timeoutMs });
};

const waitForGitClean = async (
  paths,
  { intervalMs = 500, timeoutMs = DEFAULT_CLEAN_TIMEOUT_MS } = {}
) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const result = spawnSync("git", ["diff", "--quiet", "--", ...paths], {
      stdio: "ignore"
    });

    if (result.status === 0) {
      return;
    }

    if (result.status !== 1) {
      throw new Error(`git diff --quiet failed with status ${result.status}.`);
    }

    await delay(Math.min(intervalMs, Math.max(deadline - Date.now(), 0)));
  }

  spawnSync("git", ["diff", "--", ...paths], {
    stdio: "inherit"
  });
  throw new Error(`${paths.join(", ")} did not return to a clean state after dev shutdown.`);
};

export const runDevSmoke = async ({
  cleanTimeoutMs = DEFAULT_CLEAN_TIMEOUT_MS,
  host = DEFAULT_HOST,
  port,
  shutdownTimeoutMs = DEFAULT_SHUTDOWN_TIMEOUT_MS,
  startTimeoutMs = DEFAULT_START_TIMEOUT_MS
} = {}) => {
  const devPort = port ?? (await getAvailablePort(host));
  const url = `http://${host}:${devPort}/`;
  const devServer = spawn(
    "npm",
    ["run", "dev", "--", "--hostname", host, "--port", String(devPort)],
    {
      detached: true,
      stdio: "inherit"
    }
  );

  let startupError;

  try {
    const result = await Promise.race([
      waitForHttpOk(url, { timeoutMs: startTimeoutMs }),
      once(devServer, "error").then(([error]) => {
        throw error;
      }),
      once(devServer, "exit").then(([code, signal]) => {
        throw new Error(`Dev server exited before ${url} responded (code=${code}, signal=${signal}).`);
      })
    ]);

    console.log(`Dev server responded with HTTP ${result.status}; bytes=${result.bytes}`);
  } catch (error) {
    startupError = error;
  } finally {
    await stopProcessGroup(devServer, { timeoutMs: shutdownTimeoutMs });
  }

  if (startupError) {
    throw startupError;
  }

  await waitForGitClean(["next-env.d.ts"], { timeoutMs: cleanTimeoutMs });
  console.log("next-env.d.ts restored to production route types.");
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runDevSmoke().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
