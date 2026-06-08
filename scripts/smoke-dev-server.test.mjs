import assert from "node:assert/strict";
import { createServer } from "node:http";
import { test } from "node:test";

import { getAvailablePort, waitForHttpOk } from "./smoke-dev-server.mjs";

const listen = (server, port = 0, host = "127.0.0.1") =>
  new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.off("error", reject);
      resolve(server.address());
    });
  });

const close = (server) =>
  new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

test("getAvailablePort does not return an already occupied port", async () => {
  const occupiedServer = createServer((_request, response) => {
    response.end("occupied");
  });
  const occupiedAddress = await listen(occupiedServer);

  try {
    const availablePort = await getAvailablePort("127.0.0.1");

    assert.notEqual(availablePort, occupiedAddress.port);
    assert.equal(typeof availablePort, "number");
  } finally {
    await close(occupiedServer);
  }
});

test("waitForHttpOk waits for a 200 response and reports downloaded bytes", async () => {
  const server = createServer((_request, response) => {
    response.end("ready");
  });
  const address = await listen(server);

  try {
    const result = await waitForHttpOk(`http://127.0.0.1:${address.port}/`, {
      intervalMs: 10,
      timeoutMs: 1_000
    });

    assert.deepEqual(result, {
      bytes: 5,
      status: 200
    });
  } finally {
    await close(server);
  }
});
