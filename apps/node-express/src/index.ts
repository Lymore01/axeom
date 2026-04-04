import { authRoutes } from "@axiom/auth";
import Axiom from "@axiom/core";
import { cors } from "@axiom/cors";
import { createExpressAdapter } from "@axiom/express";
import { rateLimit } from "@axiom/rate-limit";
import { securityHeaders } from "@axiom/security";
import { staticPlugin } from "@axiom/static";
import z from "zod";

export const axiom = new Axiom()
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
      body: z.object({
        name: z.string(),
        age: z.number(),
        email: z.email(),
      }),
    },
  )
  .get("/users/:id", ({ params }) => {
    return { id: params.id };
  })
  .get("/posts", () => {
    return { message: "List of posts (Node/Express)" };
  })
  .get("/test", ({ logger, db }) => {
    logger.info("Fetching data...");
    return db.query("SELECT * FROM users");
  });
const server = createExpressAdapter(axiom);

server.listen(3000, () => {
  console.log("Axiom is live (Node/Express) at http://localhost:3000");
});
