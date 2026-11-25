// Next.js may give route handlers its listener URL behind a reverse proxy.
// In the standalone build, use the configured browser-facing origin.
export function requestOrigin(request: Request): string {
  if (process.env.SYNAPSE_STANDALONE_BUILD === "1") {
    const origin = process.env.SYNAPSE_PUBLIC_ORIGIN;
    if (!origin) throw new Error("SYNAPSE_PUBLIC_ORIGIN is required.");
    return origin;
  }
  return new URL(request.url).origin;
}
