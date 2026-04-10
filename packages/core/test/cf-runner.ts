import { build } from "esbuild";
import { rm } from "fs/promises";
import { Miniflare } from "miniflare";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const entryPath = path.resolve(__dirname, "parity-check.ts");
const outputPath = path.resolve(__dirname, "parity-check.bundle.js");

async function run() {
  console.log("\x1b[34m[Parity] Bundling parity-check.ts...\x1b[0m");

  await build({
    entryPoints: [entryPath],
    bundle: true,
    outfile: outputPath,
    format: "esm",
    platform: "browser",
    conditions: ["workerd", "browser"],
    mainFields: ["browser", "module", "main"],
    external: ["node:*"],
    define: {
      __IS_WORKERD__: "true",
    },
  });

  console.log("\x1b[34m[Parity] Starting Workerd (Miniflare) runner...\x1b[0m");

  const mf = new Miniflare({
    modules: true,
    scriptPath: outputPath,
  });

  try {
    const res = await mf.dispatchFetch("http://localhost/");
    const text = await res.text();
    console.log(`\x1b[32m[Workerd] Runner received: ${text}\x1b[0m`);

    // The console logs from the worker will appear in the main process console automatically

    await mf.dispose();
    try {
      await rm(outputPath);
    } catch {}
    process.exit(0);
  } catch (err) {
    console.error(`\x1b[31m[Workerd] Runner Error: ${err}\x1b[0m`);
    await mf.dispose();
    try {
      await rm(outputPath);
    } catch {}
    process.exit(1);
  }
}

run();
