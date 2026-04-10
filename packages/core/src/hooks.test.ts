import { describe, expect, it, vi } from "vitest";
import Axeom from "./index";

describe("Axeom Lifecycle Hooks", () => {
  it("should execute hooks in the correct sequence", async () => {
    const sequence: string[] = [];

    const app = new Axeom()
      .onBeforeMatch(async () => {
        sequence.push("beforeMatch");
      })
      .onBeforeHandle(async () => {
        sequence.push("beforeHandle");
      })
      .onAfterHandle(async () => {
        sequence.push("afterHandle");
      })
      .onResponse(async () => {
        sequence.push("onResponse");
      })
      .get("/test", () => {
        sequence.push("handler");
        return { ok: true };
      });

    await app.handle(new Request("http://localhost/test"));

    expect(sequence).toEqual([
      "beforeMatch",
      "beforeHandle",
      "handler",
      "afterHandle",
      "onResponse",
    ]);
  });

  it("should short-circuit if onBeforeMatch returns a Response", async () => {
    const sequence: string[] = [];

    const app = new Axeom()
      .onBeforeMatch(async () => {
        sequence.push("beforeMatch");
        return new Response("early exit");
      })
      .get("/test", () => {
        sequence.push("handler");
        return { ok: true };
      });

    const res = await app.handle(new Request("http://localhost/test"));
    const text = await res.text();

    expect(text).toBe("early exit");
    expect(sequence).toEqual(["beforeMatch"]);
  });

  it("should short-circuit if onBeforeHandle returns a Response", async () => {
    const sequence: string[] = [];

    const app = new Axeom()
      .onBeforeHandle(async () => {
        sequence.push("beforeHandle");
        return new Response("early handle exit");
      })
      .get("/test", () => {
        sequence.push("handler");
        return { ok: true };
      });

    const res = await app.handle(new Request("http://localhost/test"));
    const text = await res.text();

    expect(text).toBe("early handle exit");
    expect(sequence).toEqual(["beforeHandle"]);
  });

  it("should catch errors and still execute onResponse", async () => {
    const sequence: string[] = [];

    const app = new Axeom()
      .onResponse(async () => {
        sequence.push("onResponse");
      })
      .get("/error", () => {
        sequence.push("handler");
        throw new Error("BOOM");
      });

    const res = await app.handle(new Request("http://localhost/error"));
    expect(res.status).toBe(500);
    expect(sequence).toEqual(["handler", "onResponse"]);
  });

  it("should handle context mutation in hooks", async () => {
    const app = new Axeom<{ user?: string }>()
      .onBeforeHandle(async (ctx) => {
        ctx.user = "kelly";
      })
      .get("/whoami", (ctx) => {
        return { user: ctx.user };
      });

    const res = await app.handle(new Request("http://localhost/whoami"));
    const data = await res.json();
    expect(data.user).toBe("kelly");
  });
});
