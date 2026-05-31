import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";

import { createNextDevCleanupRunner } from "./next-dev-clean-env-runner.mjs";
import { shutdownSignalExitCodes, shutdownSignals } from "./next-dev-clean-env-signals.mjs";

test("forwards SIGHUP so route types can be restored on terminal hangup", () => {
  assert.deepEqual(shutdownSignals, ["SIGINT", "SIGTERM", "SIGHUP"]);
  assert.equal(shutdownSignalExitCodes.get("SIGHUP"), 129);
});

test("restores route types and exits with SIGHUP code after child hangup", () => {
  class FakeChild extends EventEmitter {
    killed = false;
    killedWith = [];

    kill(signal) {
      this.killed = true;
      this.killedWith.push(signal);
      this.emit("exit", null, signal);
    }
  }

  const child = new FakeChild();
  const registeredHandlers = new Map();
  const spawnCalls = [];
  const typegenCalls = [];
  const exits = [];

  createNextDevCleanupRunner({
    argv: ["--hostname", "127.0.0.1"],
    consoleLike: { error: () => {} },
    nextBinPath: "/fake/next",
    processLike: {
      execPath: "/fake/node",
      exit: (code) => exits.push(code),
      on: (signal, handler) => registeredHandlers.set(signal, handler)
    },
    spawn: (...args) => {
      spawnCalls.push(args);
      return child;
    },
    spawnSync: (...args) => {
      typegenCalls.push(args);
      return { status: 0 };
    }
  });

  registeredHandlers.get("SIGHUP")();

  assert.deepEqual(spawnCalls, [
    ["/fake/node", ["/fake/next", "dev", "--hostname", "127.0.0.1"], { stdio: "inherit" }]
  ]);
  assert.deepEqual(child.killedWith, ["SIGHUP"]);
  assert.deepEqual(typegenCalls, [["/fake/node", ["/fake/next", "typegen"], { stdio: "ignore" }]]);
  assert.deepEqual(exits, [129]);
});
