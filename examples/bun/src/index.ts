import { authRoutes } from "@axeom/auth";
import Axeom, { s } from "axeom";

const axeom = new Axeom()
  .decorate({
    db: { query: (sql: string) => `Result from Bun DB for ${sql}` },
    log: (msg: string) => console.log(`[BUN LOG]: ${msg}`),
  })
  .derive(({ headers }) => {
    return {
      user: headers.get("user-id"),
    };
  })
  .use(authRoutes)
  .onRequest((ctx) => {
    console.log(`[BUN]: Request to ${ctx.request.url}`);
  })
  .get("/whoami", ({ user }: any) => `Axeom on Bun: Hello ${user}`)
  .get("/posts", () => {
    return {
      message: "This is running natively on Bun!",
      runtime: "bun",
      version: (globalThis as any).Bun?.version || "unknown",
    };
  })
  .post(
    "/echo",
    (ctx) => {
      return {
        received: ctx.body,
        timestamp: new Date().toISOString(),
      };
    },
    {
      body: s.object({
        name: s.string(),
        age: s.number().optional(),
      }),
    },
  );

console.log("Axeom is live (Bun Native) at http://localhost:3001");

export default {
  port: 3001,
  async fetch(req: Request) {
    return axeom.handle(req);
  },
};
