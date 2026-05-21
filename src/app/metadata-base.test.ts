import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveMetadataBase } from "./metadata-base.ts";

describe("resolveMetadataBase", () => {
  const unsetEnv = {
    siteUrl: "",
    vercelUrl: ""
  };

  it("uses a fully qualified canonical site URL", () => {
    const metadataBase = resolveMetadataBase({
      ...unsetEnv,
      siteUrl: "https://example.com"
    });

    assert.equal(metadataBase?.href, "https://example.com/");
  });

  it("normalizes a bare canonical site host to HTTPS", () => {
    const metadataBase = resolveMetadataBase({
      ...unsetEnv,
      siteUrl: "example.com"
    });

    assert.equal(metadataBase?.href, "https://example.com/");
  });

  it("prefers the canonical site URL over the Vercel deployment host", () => {
    const metadataBase = resolveMetadataBase({
      siteUrl: "example.com",
      vercelUrl: "preview.vercel.app"
    });

    assert.equal(metadataBase?.href, "https://example.com/");
  });

  it("uses the Vercel deployment host when no canonical site URL is set", () => {
    const metadataBase = resolveMetadataBase({
      ...unsetEnv,
      vercelUrl: "hobgoblin-dungeon.vercel.app"
    });

    assert.equal(metadataBase?.href, "https://hobgoblin-dungeon.vercel.app/");
  });

  it("uses the configured project homepage when no deploy host is configured", () => {
    const metadataBase = resolveMetadataBase(unsetEnv);

    assert.equal(metadataBase?.href, "https://hobgoblin-dungeon.vercel.app/");
  });

  it("rejects non-http URL protocols instead of treating them as bare hosts", () => {
    assert.throws(
      () =>
        resolveMetadataBase({
          ...unsetEnv,
          siteUrl: "mailto:foo@example.com"
        }),
      /must use http or https/
    );
  });
});
