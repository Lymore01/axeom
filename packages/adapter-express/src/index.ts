import type { Axeom } from "@axeom/core";
import express, { type Express } from "express";
import { WebSocketServer } from "ws";

export interface ExpressAdapterOptions {
  port?: number;
  onListen?: () => void;
}

/**
 * Bridges the Axeom engine with an Express application.
 * Handles the conversion of Node.js req/res to Web Request/Response.
 */
export function createExpressAdapter(
  Axeom: Axeom<any, any>,
  app: Express = express(),
) {
  const wss = new WebSocketServer({ noServer: true });
  app.use(async (req, res) => {
    const protocol = req.protocol;
    const host = req.get("host");
    const fullUrl = `${protocol}://${host}${req.originalUrl}`;

    try {
      const webRequest = new Request(fullUrl, {
        method: req.method,
        headers: new Headers(req.headers as any),
        body: ["GET", "HEAD"].includes(req.method) ? null : (req as any),
        // @ts-expect-error - Required for Node.js Fetch with a stream body
        duplex: "half",
      });

      const webResponse = await Axeom.handle(webRequest);

      webResponse.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      res.status(webResponse.status);

      if (webResponse.body) {
        const reader = webResponse.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
      }
      res.end();
    } catch (error) {
      console.error("Adapter Error:", error);
      res.status(500).json({ error: "Internal Adapter Error" });
    }
  });

  return {
    listen: (port: number, cb?: () => void) => {
      const server = app.listen(port, cb);

      server.on("upgrade", async (request, socket, head) => {
        const protocol = (request as any).connection?.encrypted ? "https" : "http";
        const fullUrl = `${protocol}://${request.headers.host}${request.url}`;
        console.log(`\x1b[35m[Adapter]\x1b[0m Upgrade requested: ${fullUrl}`);

        try {
          const webRequest = new Request(fullUrl, {
            method: request.method || "GET",
            headers: new Headers(request.headers as any),
          });

          // Run the full handshake through the engine (including Identity, Hooks, etc.)
          const { response, context } = await Axeom._handleHandshake(webRequest);
          const isWSHandshake = response.status === 101 || response.headers.get("X-Axeom-Status") === "101";
          console.log(`\x1b[35m[Adapter]\x1b[0m Handshake status: ${response.status} (WS: ${isWSHandshake})`);

          if (isWSHandshake) {
            wss.handleUpgrade(request, socket, head, (ws: any) => {
              // Capture context for and decorators for ws.data
              ws.data = context || {};

              const matched = Axeom.router.match(request.method || "GET", new URL(fullUrl).pathname);
              console.log(`\x1b[35m[Adapter]\x1b[0m Matched WS Route: ${!!matched}`);
              const handlers = matched?.route.metadata?.ws;

              if (handlers) {
                handlers.open?.(ws);
                ws.on("message", (data: any) => handlers.message?.(ws, data));
                ws.on("close", (code: number, reason: Buffer) =>
                  handlers.close?.(ws, code, reason.toString()),
                );
                ws.on("error", (err: any) => handlers.error?.(ws, err));
              }
            });
          } else {
            // Handshake failed (e.g., 401 Unauthorized or 400 Validation Failed)
            socket.write(
              `HTTP/1.1 ${response.status} ${response.statusText}\r\n\r\n`,
            );
            socket.destroy();
          }
        } catch (error) {
          console.error("WebSocket Handshake Error:", error);
          socket.destroy();
        }
      });

      return server;
    },
  };
}
