import type { Axiom } from "@axiom/core";

export interface CompressionOptions {
  /**
   * Minimum response size in bytes to apply compression.
   * @default 1024 (1KB)
   */
  threshold?: number;
}

/**
 * Axiom Compression Plugin.
 * Automatically compresses large responses using gzip or deflate based on the 'Accept-Encoding' header.
 * Uses the standards-compliant CompressionStream API.
 */
export const compression = (options: CompressionOptions = {}) => {
  const threshold = options.threshold ?? 1024;

  return <T extends Record<string, any>, D extends Record<string, any>>(
    app: Axiom<T, D>,
  ) => {
    return app.onResponse(async (res: Response, ctx) => {
      if (
        !res.body ||
        res.headers.has("Content-Encoding") ||
        res.headers.get("Content-Type") === "text/event-stream"
      ) {
        return res;
      }

      const contentLength = res.headers.get("Content-Length");
      if (contentLength && parseInt(contentLength) < threshold) {
        // console.log(
        //   "[Axiom Compression] Skipping compression for small response",
        // );
        return res;
      }
      // console.log("[Axiom Compression] Compressing response");

      // negotiate encoding
      const acceptEncoding = ctx.headers.get("Accept-Encoding") || "";
      let encoding: "gzip" | "deflate" | null = null;

      if (acceptEncoding.includes("gzip")) {
        encoding = "gzip";
      } else if (acceptEncoding.includes("deflate")) {
        encoding = "deflate";
      }

      if (!encoding) return res;

      try {
        // @ts-ignore - CompressionStream is available in modern runtimes (Bun, Deno, Node 18+)
        const compressionStream = new CompressionStream(encoding);
        const compressedBody = res.body.pipeThrough(compressionStream);

        const newRes = new Response(compressedBody, {
          status: res.status,
          statusText: res.statusText,
          headers: new Headers(res.headers),
        });

        newRes.headers.set("Content-Encoding", encoding);
        newRes.headers.append("Vary", "Accept-Encoding");
        newRes.headers.delete("Content-Length");

        return newRes;
      } catch (err) {
        // Fallback to original response if compression fails
        console.warn("[Axiom Compression] Failed to stream compression:", err);
        return res;
      }
    });
  };
};

export default compression;
