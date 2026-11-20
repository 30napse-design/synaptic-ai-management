import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const cli = fileURLToPath(new URL("../node_modules/vinext/dist/cli.js", import.meta.url));
const child = spawn(process.execPath, [cli, "start", ...process.argv.slice(2)], {
  stdio: "inherit",
  env: process.env,
});

child.on("error", (error) => {
  console.error(error);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) process.exit(1);
  process.exit(code ?? 1);
});
