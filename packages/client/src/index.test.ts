import { describe, expect, it } from "vitest";
import Axeom, { s } from "../../axeom/src/index";
import { createAxeomClient } from "./index";

describe("Axeom Client Integration", () => {
  const app = new Axeom()
    .get("/hello", () => ({ message: "world" }), {
      description: "Say hello to the world",
    })
    .get("/user/:id", ({ params }) => ({
      id: Number(params.id),
      name: "Kelly",
    }))
    .post("/echo", ({ body }) => body, {
      body: s.object({
        text: s.string(),
      }),
    });

  type App = typeof app;

  // Create a client that talks directly to the app instance instead of the network
  const client = createAxeomClient<App>("http://localhost", {
    fetch: (url, init) => app.handle(new Request(url, init)),
  });

  it("should fetch basic GET route", async () => {
    const res = await client.hello.get();
    expect(res).toEqual({ message: "world" });
  });

  it("should handle path parameters", async () => {
    const res = await client.user("123").get();
    expect(res).toEqual({ id: 123, name: "Kelly" });
  });

  it("should send POST body and receive data", async () => {
    const res = await client.echo.post({
      body: { text: "hello axeom" },
    });
    expect(res).toEqual({ text: "hello axeom" });
  });

  it("should throw error on validation failure", async () => {
    try {
      // @ts-expect-error - testing runtime error for invalid body
      await client.echo.post({
        body: { text: 123 },
      });
    } catch (error: any) {
      expect(error.message).toContain("VALIDATION_FAILED");
    }
  });

  it("should handle root paths", async () => {
    const rootApp = new Axeom().get("/", () => ({ root: true }));
    type RootApp = typeof rootApp;

    const rootClient = createAxeomClient<RootApp>("http://localhost", {
      fetch: (url, init) => rootApp.handle(new Request(url, init)),
    });

    const res = await rootClient.get();
    expect(res).toEqual({ root: true });
  });
});
