import { describe, expect, it } from "vitest";
import Axeom, { s } from "../../../axeom/src/index";
import { swagger } from "./index";

describe("Swagger Plugin", () => {
  it("should generate valid OpenAPI JSON", async () => {
    const app = new Axeom().use(swagger()).get("/hello", () => ({ message: "world" }), {
      description: "Say hello to the world",
      responses: {
        200: s.object({
          message: s.string(),
        }),
      },
    });

    // Request the swagger JSON
    const res = await app.handle(new Request("http://localhost/swagger.json"));
    expect(res.status).toBe(200);

    const spec = await res.json();

    // Check OpenAPI structure
    expect(spec.openapi).toBe("3.1.0");
    expect(spec.paths["/hello"]).toBeDefined();
    expect(spec.paths["/hello"].get.description).toBe("Say hello to the world");
    expect(spec.paths["/hello"].get.responses["200"]).toBeDefined();
  });

  it("should include path parameters in OpenAPI spec", async () => {
    const app = new Axeom().use(swagger()).get("/user/:id", ({ params }) => ({ id: params.id }), {
      params: s.object({
        id: s.string(),
      }),
    });

    const res = await app.handle(new Request("http://localhost/swagger.json"));
    const spec = await res.json();

    expect(spec.paths["/user/{id}"]).toBeDefined();
    expect(spec.paths["/user/{id}"].get.parameters).toContainEqual(
      expect.objectContaining({
        name: "id",
        in: "path",
        required: true,
      }),
    );
  });

  it("should serve the Swagger UI HTML", async () => {
    const app = new Axeom().use(swagger());

    const res = await app.handle(new Request("http://localhost/docs"));
    expect(res.status).toBe(200);

    const html = await res.text();
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("<!-- Scalar Web Component -->");
  });
});
