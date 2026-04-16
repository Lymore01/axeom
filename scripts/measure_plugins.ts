
import { $ } from "bun";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

const PLUGINS_DIR = join(import.meta.dir, "../packages/plugins");
const plugins = await readdir(PLUGINS_DIR);

console.log("| Plugin | Size (KB) | Build Status |");
console.log("| :--- | :--- | :--- |");

for (const plugin of plugins) {
  const entry = join(PLUGINS_DIR, plugin, "src/index.ts");
  try {
    const build = await $`bun build ${entry} --minify --target bun`.nothrow().quiet();
    if (build.exitCode === 0) {
      const size = build.stdout.length;
      const sizeKB = (size / 1024).toFixed(2);
      console.log(`| ${plugin} | ${sizeKB} KB | ✅ |`);
    } else {
      console.log(`| ${plugin} | - | ❌ |`);
    }
  } catch (e) {
    console.log(`| ${plugin} | - | ❌ |`);
  }
}
