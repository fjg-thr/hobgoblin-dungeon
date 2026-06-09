import assert from "node:assert/strict";
import { test } from "node:test";

import { runProductionSmoke } from "./smoke-prod-server.mjs";

const httpServerScript = `
  import { createServer } from "node:http";

  const host = process.argv[1];
  const port = Number(process.argv[2]);

  createServer((_request, response) => {
    response.end("ready");
  }).listen(port, host);
`;

test("runProductionSmoke starts a server on its selected port and reports HTTP 200", async () => {
  const result = await runProductionSmoke({
    command: process.execPath,
    createArgs: ({ host, port }) => [
      "--input-type=module",
      "-e",
      httpServerScript,
      host,
      String(port)
    ],
    shutdownTimeoutMs: 1_000,
    startTimeoutMs: 3_000
  });

  assert.equal(result.status, 200);
  assert.equal(result.bytes, 5);
});

test("runProductionSmoke rejects when the spawned server exits before serving HTTP 200", async () => {
  await assert.rejects(
    runProductionSmoke({
      command: process.execPath,
      createArgs: () => ["-e", "process.exit(17)"],
      shutdownTimeoutMs: 1_000,
      startTimeoutMs: 1_000
    }),
    /Production server exited before .* responded \(code=17, signal=null\)/
  );
});
