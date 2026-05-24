import assert from "node:assert/strict";
import test from "node:test";

import {
  buildBugbotUpdateRequest,
  deployBugbot,
  parseEnabledFlag
} from "./deploy-cursor-bugbot.mjs";

test("buildBugbotUpdateRequest creates the Cursor Bugbot enable request", () => {
  const request = buildBugbotUpdateRequest({
    apiKey: "cursor-token",
    repoUrl: "https://github.com/fjg-thr/hobgoblin-dungeon",
    enabled: true
  });

  assert.equal(request.url, "https://api.cursor.com/bugbot/repo/update");
  assert.equal(request.options.method, "POST");
  assert.deepEqual(request.options.headers, {
    Authorization: "Bearer cursor-token",
    "Content-Type": "application/json"
  });
  assert.deepEqual(JSON.parse(request.options.body), {
    repoUrl: "https://github.com/fjg-thr/hobgoblin-dungeon",
    enabled: true
  });
});

test("buildBugbotUpdateRequest rejects missing deployment inputs", () => {
  assert.throws(
    () => buildBugbotUpdateRequest({ apiKey: "", repoUrl: "https://github.com/fjg-thr/hobgoblin-dungeon" }),
    /CURSOR_API_KEY/
  );
  assert.throws(
    () => buildBugbotUpdateRequest({ apiKey: "cursor-token", repoUrl: "" }),
    /BUGBOT_REPO_URL/
  );
});

test("parseEnabledFlag treats only explicit false as disabling Bugbot", () => {
  assert.equal(parseEnabledFlag(undefined), true);
  assert.equal(parseEnabledFlag(""), true);
  assert.equal(parseEnabledFlag("true"), true);
  assert.equal(parseEnabledFlag("1"), true);
  assert.equal(parseEnabledFlag("false"), false);
  assert.equal(parseEnabledFlag("FALSE"), false);
});

test("deployBugbot returns parsed API response details", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });

    return {
      ok: true,
      status: 200,
      async text() {
        return JSON.stringify({ repoUrl: "https://github.com/fjg-thr/hobgoblin-dungeon", enabled: true });
      }
    };
  };

  const result = await deployBugbot({
    apiKey: "cursor-token",
    repoUrl: "https://github.com/fjg-thr/hobgoblin-dungeon",
    enabled: true,
    fetchImpl
  });

  assert.equal(calls.length, 1);
  assert.equal(result.enabled, true);
  assert.deepEqual(result.response, {
    repoUrl: "https://github.com/fjg-thr/hobgoblin-dungeon",
    enabled: true
  });
});

test("deployBugbot includes status and body when Cursor API fails", async () => {
  const fetchImpl = async () => ({
    ok: false,
    status: 403,
    async text() {
      return "You do not have permission to modify settings for this installation";
    }
  });

  await assert.rejects(
    () =>
      deployBugbot({
        apiKey: "cursor-token",
        repoUrl: "https://github.com/fjg-thr/hobgoblin-dungeon",
        fetchImpl
      }),
    /Cursor Bugbot deployment failed with 403: You do not have permission/
  );
});
