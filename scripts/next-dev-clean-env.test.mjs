import assert from "node:assert/strict";
import test from "node:test";

import { shutdownSignalExitCodes, shutdownSignals } from "./next-dev-clean-env-signals.mjs";

test("forwards SIGHUP so route types can be restored on terminal hangup", () => {
  assert.deepEqual(shutdownSignals, ["SIGINT", "SIGTERM", "SIGHUP"]);
  assert.equal(shutdownSignalExitCodes.get("SIGHUP"), 129);
});
