import { describe, expect, it } from "vitest";
import { s } from "./index";

describe("Axeom Schema Library", () => {
  describe("StringSchema", () => {
    it("should validate strings", async () => {
      const schema = s.string();
      expect(await schema.parse("hello")).toBe("hello");
      await expect(schema.parse(123)).rejects.toThrow("Expected string");
    });

    it("should handle min/max length", async () => {
      const schema = s.string().min(5).max(10);
      expect(await schema.parse("hello")).toBe("hello");
      await expect(schema.parse("hi")).rejects.toThrow("Too short");
      await expect(schema.parse("verylongstring")).rejects.toThrow("Too long");
    });
  });

  describe("EnumSchema", () => {
    it("should validate enum values", async () => {
      const schema = s.enum(["a", "b"]);
      expect(await schema.parse("a")).toBe("a");
      await expect(schema.parse("c")).rejects.toThrow("Expected one of: a, b");
    });
  });

  describe("ObjectSchema", () => {
    it("should validate objects", async () => {
      const schema = s.object({
        name: s.string(),
        age: s.number(),
      });
      const data = { name: "Kelly", age: 30 };
      expect(await schema.parse(data)).toEqual(data);
    });

    it("should handle optional fields", async () => {
      const schema = s.object({
        name: s.string(),
        description: s.string().optional(),
      });

      // With optional field
      expect(await schema.parse({ name: "A", description: "B" })).toEqual({
        name: "A",
        description: "B",
      });

      // Without optional field
      expect(await schema.parse({ name: "A" })).toEqual({ name: "A" });
    });

    it("should handle nested objects", async () => {
      const schema = s.object({
        user: s.object({
          id: s.number(),
        }),
      });
      expect(await schema.parse({ user: { id: 1 } })).toEqual({ user: { id: 1 } });
    });
  });

  describe("ArraySchema", () => {
    it("should validate arrays", async () => {
      const schema = s.array(s.number());
      expect(await schema.parse([1, 2, 3])).toEqual([1, 2, 3]);
      await expect(schema.parse([1, "2"])).rejects.toThrow("[1]: Expected number");
    });
  });
});
