import type { Axeom } from "@axeom/core";

export interface UploadOptions {
  dest?: string;
}

/**
 * Universal file saver that detects the runtime (Bun, Deno)
 * and uses the fastest native method to write to disk.
 */
export async function saveFile(file: File | Blob, path: string) {
  // @ts-expect-error - Bun detection
  if (typeof Bun !== "undefined") {
    // @ts-expect-error
    const { dirname } = await import("node:path");
    // @ts-expect-error
    await (await import("node:fs/promises")).mkdir(dirname(path), {
      recursive: true,
    });
    // @ts-expect-error
    return await Bun.write(path, file);
  }

  // @ts-expect-error - Deno detection
  if (typeof Deno !== "undefined" && typeof Deno.writeFile === "function") {
    // @ts-expect-error
    const { dirname } = await import("node:path");
    // @ts-expect-error
    await Deno.mkdir(dirname(path), { recursive: true });
    // @ts-expect-error
    const data = new Uint8Array(await file.arrayBuffer());
    // @ts-expect-error
    return await Deno.writeFile(path, data);
  }

  // Node.js detection
  // @ts-expect-error
  if (typeof process !== "undefined" && process.release?.name === "node") {
    // Dynamic import to avoid including fs in Bun/Deno bundles
    const { writeFile, mkdir } = await import("node:fs/promises");
    const { dirname } = await import("node:path");
    await mkdir(dirname(path), { recursive: true });

    const data = new Uint8Array(await file.arrayBuffer());
    return await writeFile(path, data);
  }

  throw new Error("[Axeom Upload] Current runtime is not supported for native file writing.");
}

/**
 * The Axeom Upload Plugin.
 * Adds a unified storage utility to the context.
 */
export const uploadPlugin =
  (options: UploadOptions = {}) =>
  <T extends Record<string, any>, D extends Record<string, any>>(app: Axeom<T, D>) => {
    return app.decorate({
      storage: {
        save: saveFile,
        defaultDest: options.dest || "./uploads",
      },
    });
  };

export default uploadPlugin;
