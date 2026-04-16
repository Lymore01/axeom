import { authPlugin, authRoutes } from "@axeom/auth";
import { compression } from "@axeom/compression";
import { cors } from "@axeom/cors";
import { createExpressAdapter } from "@axeom/express";
import { rateLimit } from "@axeom/rate-limit";
import { securityHeaders } from "@axeom/security";
import { staticPlugin } from "@axeom/static";
import { swagger } from "@axeom/swagger";
import uploadPlugin from "@axeom/upload";
import { wsPlugin } from "@axeom/ws";
import Axeom, { logger, s } from "axeom";

const axeom = new Axeom()
  .use(logger())
  .use(wsPlugin())
  .use(swagger({ info: { title: "Axeom Node/Express API" } }))
  .use(authPlugin({ secret: "DEVELOPMENT_SECRET_KEY" }))
  .use(uploadPlugin({ dest: "./uploads" }))
  .use(compression({ threshold: 1024 }))
  .use(cors())
  .use(securityHeaders())
  .use(rateLimit({ limit: 10, windowMs: 60 * 1000 }))
  .use(
    staticPlugin({
      prefix: "/static",
      rootPath: "./public",
      maxAge: 60 * 60 * 24,
    }),
  )
  .decorate({
    db: { query: (sql: string) => `Result for ${sql}` },
  })
  .derive((ctx) => {
    return {
      userId: ctx.headers.get("x-user-id") || "anonymous",
    };
  })
  .ws("/chat", {
    open(ws) {
      console.log("\x1b[36m[Node WS]\x1b[0m Client connected!");
      console.log("\x1b[36m[Node WS]\x1b[0m Handshake Data:", JSON.stringify(ws.data));
      ws.send("Welcome to Axeom WebSocket (Node/Express)!");
    },
    message(ws, msg) {
      console.log(`\x1b[36m[Node WS]\x1b[0m Received: ${msg}`);
      ws.send(`Echo (Node): ${msg}`);
    },
  })
  .post(
    "/test",
    ({ body }) => {
      return body;
    },
    {
      body: s.object({
        name: s.string().min(3).toLowerCase().trim(),
        age: s.number(),
        email: s.string().email(),
      }),
    },
  )
  .get("/users/:id", ({ params }) => {
    return { id: params.id };
  })
  .get("/posts", () => {
    return { message: "List of posts (Node/Express)" };
  })
  .get("/large", () => {
    return { data: "A".repeat(2048) };
  })
  .get("/test", ({ logger, db }) => {
    logger.info("Fetching data...");
    return db.query("SELECT * FROM users");
  })
  .post(
    "/upload",
    async (ctx) => {
      const { file } = ctx.body;

      await ctx.storage.save(file, `${ctx.storage.defaultDest}/${file.name}`);

      return {
        status: "success",
        message: "File uploaded successfully",
        filename: file.name,
      };
    },
    {
      body: s.object({
        file: s.file().max(5000000).type("image/"),
      }),
    },
  )
  .sse("/events", async function* () {
    for (let i = 0; i < 10; i++) {
      yield {
        message: `Event ${i}`,
        timestamp: new Date().toISOString(),
      };
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  });

const server = createExpressAdapter(axeom as any);

server.listen(3000, () => {
  console.log("Axeom is live (Node/Express) at http://localhost:3000");
});
