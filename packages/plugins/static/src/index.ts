import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import type { Axeom } from "@axeom/core";

export const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".mp4": "video/mp4",
};

export interface StaticOptions {
  /**
   * Public path prefix for files (e.g., "/static")
   */
  prefix: string;
  /**
   * Local directory where files are stored (e.g., "./public")
   */
  rootPath: string;
  /**
   * Cache-Control max-age in seconds. Defaults to 3600.
   */
  maxAge?: number;
}

export function staticPlugin(options: StaticOptions) {
  const { prefix, rootPath, maxAge = 3600 } = options;
  const absRoot = resolve(rootPath);

  return <T extends Record<string, any>, D extends Record<string, any>>(app: Axeom<T, D>) =>
    app.get(`${prefix}/*` as any, async (ctx: any) => {
      try {
        const relativePath = (ctx.params as any)["*"] || "";

        // Security: Normalize and resolve to prevent traversal
        const filePath = join(absRoot, normalize(relativePath));

        console.log(relativePath);
        if (!filePath.startsWith(absRoot)) {
          return new Response("Forbidden", { status: 403 });
        }

        const stats = await stat(filePath);
        if (!stats.isFile()) {
          return new Response("Not a file", { status: 404 });
        }

        // Generate a Weak ETag based on size and mtime
        const etag = `W/"${stats.size}-${stats.mtime.getTime()}"`;

        // Check If-None-Match header for 304 Not Modified
        if (ctx.request.headers.get("if-none-match") === etag) {
          return new Response(null, { status: 304 });
        }

        const content = await readFile(filePath);
        const ext = extname(filePath).toLowerCase();

        return new Response(content, {
          headers: {
            "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
            "Cache-Control": `public, max-age=${maxAge}`,
            ETag: etag,
          },
        });
      } catch (_error) {
        return new Response("File not found", { status: 404 });
      }
    });
}
