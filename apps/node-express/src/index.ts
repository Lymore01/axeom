import { authPlugin, authRoutes } from "@axiom/auth";
import { compression } from "@axiom/compression";
import Axiom from "@axiom/core";
import { cors } from "@axiom/cors";
import { createExpressAdapter } from "@axiom/express";
import { rateLimit } from "@axiom/rate-limit";
import { s } from "@axiom/schema";
import { securityHeaders } from "@axiom/security";
import { staticPlugin } from "@axiom/static";
import uploadPlugin from "@axiom/upload";

export const axiom = new Axiom()
  .use(authPlugin({ secret: "DEVELOPMENT_SECRET_KEY" }))
  .use(uploadPlugin({ dest: "./uploads" }))
  .use(compression({ threshold: 1024 }))
  .use(cors({ origin: ["http://localhost:5173"] }))
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
  .use(authRoutes)
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
const server = createExpressAdapter(axiom);

server.listen(3000, () => {
  console.log("Axiom is live (Node/Express) at http://localhost:3000");
});
