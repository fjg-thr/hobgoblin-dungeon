#!/usr/bin/env node

import { pathToFileURL } from "node:url";

export const BUGBOT_REPO_UPDATE_URL = "https://api.cursor.com/bugbot/repo/update";
export const DEFAULT_BUGBOT_REPO_URL = "https://github.com/fjg-thr/hobgoblin-dungeon";

export function parseEnabledFlag(value) {
  if (typeof value !== "string") {
    return true;
  }

  return value.trim().toLowerCase() !== "false";
}

export function buildBugbotUpdateRequest({ apiKey, repoUrl, enabled = true }) {
  if (!apiKey?.trim()) {
    throw new Error("CURSOR_API_KEY is required to deploy Cursor Bugbot.");
  }

  if (!repoUrl?.trim()) {
    throw new Error("BUGBOT_REPO_URL is required to deploy Cursor Bugbot.");
  }

  return {
    url: BUGBOT_REPO_UPDATE_URL,
    options: {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        repoUrl,
        enabled
      })
    }
  };
}

function parseResponseBody(body) {
  if (!body) {
    return null;
  }

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

export async function deployBugbot({
  apiKey = process.env.CURSOR_API_KEY,
  repoUrl = process.env.BUGBOT_REPO_URL || DEFAULT_BUGBOT_REPO_URL,
  enabled = parseEnabledFlag(process.env.BUGBOT_ENABLED),
  fetchImpl = globalThis.fetch
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new Error("A fetch implementation is required to call the Cursor Bugbot API.");
  }

  const request = buildBugbotUpdateRequest({ apiKey, repoUrl, enabled });
  const response = await fetchImpl(request.url, request.options);
  const body = await response.text();
  const parsedBody = parseResponseBody(body);

  if (!response.ok) {
    const message = typeof parsedBody === "string" ? parsedBody : JSON.stringify(parsedBody);
    throw new Error(`Cursor Bugbot deployment failed with ${response.status}: ${message}`);
  }

  return {
    enabled,
    repoUrl,
    status: response.status,
    response: parsedBody
  };
}

async function main() {
  const result = await deployBugbot();
  const action = result.enabled ? "enabled" : "disabled";

  console.log(`Cursor Bugbot ${action} for ${result.repoUrl}.`);
  if (result.response) {
    console.log(JSON.stringify(result.response, null, 2));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
