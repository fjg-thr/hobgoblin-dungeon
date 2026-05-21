type MetadataBaseOptions = {
  siteUrl?: string;
  vercelUrl?: string;
};

const projectHomepage = "https://hobgoblin-dungeon.vercel.app";
const hasExplicitProtocol = (value: string) =>
  /^[a-z][a-z\d+\-.]*:\/\//i.test(value);
const hasSchemeLikePrefix = (value: string) => /^[a-z][a-z\d+\-.]*:/i.test(value);
const isBareHostWithPort = (value: string) =>
  /^[^/\s:]+:\d+(?:[/?#].*)?$/i.test(value);

const toHttpsUrl = (value: string): URL => {
  const trimmedValue = value.trim();

  if (
    hasSchemeLikePrefix(trimmedValue) &&
    !hasExplicitProtocol(trimmedValue) &&
    !isBareHostWithPort(trimmedValue)
  ) {
    throw new Error("Metadata base URL must use http or https.");
  }

  const url = new URL(
    hasExplicitProtocol(trimmedValue) ? trimmedValue : `https://${trimmedValue}`
  );

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Metadata base URL must use http or https.");
  }

  return url;
};

export const resolveMetadataBase = ({
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL,
  vercelUrl = process.env.VERCEL_URL
}: MetadataBaseOptions = {}): URL => {
  if (siteUrl?.trim()) {
    return toHttpsUrl(siteUrl);
  }

  if (vercelUrl?.trim()) {
    return toHttpsUrl(vercelUrl);
  }

  return toHttpsUrl(projectHomepage);
};
