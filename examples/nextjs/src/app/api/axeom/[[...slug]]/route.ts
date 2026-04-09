import { createNextHandler } from "@axeom/web";
import Axeom, { s } from "axeom";
import { swagger } from "axeom/swagger";

const axeom = new Axeom()
  // add a request ID and a mock "user" to every request context
  .use(
    swagger({
      info: {
        title: "Axeom Next.js Example",
        version: "1.0.0",
      },
    }),
  )
  .derive(async (ctx) => {
    const id = crypto.randomUUID();
    ctx.setResponseHeader("X-Request-ID", id);

    return {
      requestId: id,
      user: { id: "Lymore", role: "architect" },
    };
  })

  // global Logging Hook
  .onRequest(({ request, requestId }) => {
    console.log(`[Axeom] ${request.method} ${request.url} | ID: ${requestId}`);
  })

  .get("/", () => {
    return {
      status: "online",
      engine: "Axeom 1.0",
      platform: "Next.js App Router",
    };
  })

  .post(
    "/projects",
    ({ body, user, requestId }) => {
      return {
        id: "proj_" + Math.random().toString(36).slice(2),
        created_by: user.id,
        received_at: new Date().toISOString(),
        request_id: requestId,
        data: body,
      };
    },
    {
      body: s.object({
        name: s.string().min(3).trim(),
        description: s.string().max(200).optional(),
        priority: s.enum(["low", "medium", "high"]),
        metadata: s.object({
          tags: s.array(s.string()),
          is_public: s.boolean(),
        }),
      }),
    },
  )

  .sse("/stream", async function* () {
    const messages = [
      "Initializing...",
      "Checking core systems",
      "Axeom standing by",
      "Weightless performance achieved",
    ];

    for (const msg of messages) {
      yield {
        event: "status",
        data: msg,
        time: new Date().toLocaleTimeString(),
      };
      await new Promise((r) => setTimeout(r, 1500));
    }
  });

export const { GET, POST, PUT, PATCH, DELETE, OPTIONS } = createNextHandler(
  axeom,
  {
    basePath: "/api/axeom",
  },
);

export type App = typeof axeom;
