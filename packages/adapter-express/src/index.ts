import type Axiom from "@axiom/core";
import express, { type Express } from "express";

export interface ExpressAdapterOptions {
  port?: number;
  onListen?: () => void;
}

export function createExpressAdapter(
  axiom: Axiom<any, any>,
  app: Express = express(),
) {
  app.use(async (req, res) => {
    const protocol = req.protocol;
    const host = req.get("host");
    const fullUrl = `${protocol}://${host}${req.originalUrl}`;

    try {
      const webRequest = new Request(fullUrl, {
        method: req.method,
        headers: new Headers(req.headers as any),
        body: ["GET", "HEAD"].includes(req.method) ? null : (req as any),
        // @ts-ignore - Required for Node.js Fetch with a stream body
        duplex: "half",
      });

      const webResponse = await axiom.handle(webRequest);

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
      app.listen(port, cb);
    },
  };
}
