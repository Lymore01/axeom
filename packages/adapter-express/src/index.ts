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

      const contentType = webResponse.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        const data = await webResponse.json();
        res.status(webResponse.status).json(data);
      } else {
        const text = await webResponse.text();
        res.status(webResponse.status).send(text);
      }
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
