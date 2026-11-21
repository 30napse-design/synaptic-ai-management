import { fileURLToPath } from "node:url";
import { migrateDatabase } from "../runtime/sqlite.mjs";

const publicOrigin = process.env.SYNAPSE_PUBLIC_ORIGIN;
const parsedOrigin = publicOrigin ? new URL(publicOrigin) : null;
if (!parsedOrigin || !["http:", "https:"].includes(parsedOrigin.protocol) || parsedOrigin.origin !== publicOrigin) {
  throw new Error("SYNAPSE_PUBLIC_ORIGIN must be an absolute HTTP(S) origin without a path or trailing slash.");
}

migrateDatabase(fileURLToPath(new URL("../drizzle/", import.meta.url)));
const cli = new URL("../node_modules/next/dist/bin/next", import.meta.url);
process.argv.splice(1, 1, fileURLToPath(cli), "start");
await import(cli.href);
