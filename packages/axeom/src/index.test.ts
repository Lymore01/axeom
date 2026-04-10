import { describe, expect, it, vi } from "vitest";
import Axeom, { s } from "./index";

describe("Axeom Core Engine", () => {
  it("should handle basic GET routes", async () => {
    const app = new Axeom().get("/ping", () => ({ message: "pong" }));
    const request = new Request("http://localhost/ping");
    const response = await app.handle(request);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: "pong" });
  });

  it("should validate POST body with s.enum()", async () => {
    const app = new Axeom().post(
      "/project",
      ({ body }) => ({ success: true, priority: body.priority }),
      {
        body: s.object({
          name: s.string(),
          priority: s.enum(["low", "medium", "high"]),
        }),
      },
    );

    // Valid Request
    const validReq = new Request("http://localhost/project", {
      method: "POST",
      body: JSON.stringify({ name: "Axeom", priority: "high" }),
      headers: { "Content-Type": "application/json" },
    });
    const validRes = await app.handle(validReq);
    expect(validRes.status).toBe(200);
    expect(await validRes.json()).toEqual({ success: true, priority: "high" });

    // Invalid Request (Invalid Enum Value)
    const invalidReq = new Request("http://localhost/project", {
      method: "POST",
      body: JSON.stringify({ name: "Axeom", priority: "critical" }),
      headers: { "Content-Type": "application/json" },
    });
    const invalidRes = await app.handle(invalidReq);
    expect(invalidRes.status).toBe(400);
    const result = await invalidRes.json();
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        message: expect.stringContaining("Expected one of: low, medium, high"),
      }),
    );
  });

  it("should trigger lifecycle hooks in order", async () => {
    const log: string[] = [];
    const app = new Axeom()
      .derive(() => {
        log.push("derive");
        return { user: "tester" };
      })
      .onRequest(() => {
        log.push("onRequest");
      })
      .onResponse(() => {
        log.push("onResponse");
      })
      .get("/hook", () => {
        log.push("handler");
        return { ok: true };
      });

    await app.handle(new Request("http://localhost/hook"));

    expect(log).toEqual(["derive", "onRequest", "handler", "onResponse"]);
  });

  it("should handle context derivation correctly", async () => {
    const app = new Axeom()
      .derive(() => ({ requestId: "123" }))
      .get("/ctx", ({ requestId }) => ({ requestId }));

    const res = await app.handle(new Request("http://localhost/ctx"));
    expect(await res.json()).toEqual({ requestId: "123" });
  });
});
