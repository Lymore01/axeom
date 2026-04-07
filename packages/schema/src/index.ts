/**
 * Axiom Schema
 * A zero-dependency, ultra-lightweight validation library.
 */

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Standard Validator interface for Axiom.
 */
export interface Validator<T = any> {
  readonly _output: T;
  parse: (data: unknown) => T | Promise<T>;
}

/**
 * Infer the type of an Axiom Schema.
 */
export type Infer<S> = S extends Validator<infer T> ? T : never;

/**
 * Base Schema class providing common modifiers.
 */
export abstract class AxiomSchema<T> implements Validator<T> {
  readonly _output!: T;
  protected _isOptional = false;
  protected _isNullable = false;
  protected _defaultValue?: T;
  protected _transforms: Array<(data: any) => any> = [];

  protected abstract _validate(data: unknown): ValidationResult<T>;

  async parse(data: unknown): Promise<T> {
    // 1. Handle missing / null values
    if (data === undefined) {
      if (this._defaultValue !== undefined) data = this._defaultValue;
      else if (this._isOptional) return undefined as any;
      else throw new Error("Required field is missing");
    }

    if (data === null) {
      if (this._isNullable) return null as any;
      throw new Error("Field cannot be null");
    }

    // 2. Perform Type Validation
    const result = this._validate(data);
    if (!result.success) throw new Error(result.error);

    // 3. Apply Transforms/Refinements
    let finalData = result.data;
    for (const transform of this._transforms) {
      finalData = await transform(finalData);
    }
    return finalData;
  }

  optional(): this & AxiomSchema<T | undefined> {
    this._isOptional = true;
    return this as any;
  }

  nullable(): this & AxiomSchema<T | null> {
    this._isNullable = true;
    return this as any;
  }

  default(val: T): this {
    this._defaultValue = val;
    return this;
  }

  transform<U>(fn: (data: T) => U | Promise<U>): AxiomSchema<U> & this {
    this._transforms.push(fn);
    return this as any;
  }

  refine(
    fn: (data: T) => boolean | Promise<boolean>,
    message = "Invalid value",
  ): this {
    return this.transform(async (data) => {
      if (!(await fn(data))) throw new Error(message);
      return data;
    }) as any;
  }
}

/**
 * String Schema
 */
class StringSchema extends AxiomSchema<string> {
  protected _validate(data: unknown): ValidationResult<string> {
    return typeof data === "string"
      ? { success: true, data }
      : { success: false, error: `Expected string, got ${typeof data}` };
  }

  min(n: number) {
    this.refine((v) => v.length >= n, `Too short (min ${n} characters)`);
    return this;
  }

  max(n: number) {
    this.refine((v) => v.length <= n, `Too long (max ${n} characters)`);
    return this;
  }

  length(n: number) {
    this.refine((v) => v.length === n, `Must be exactly ${n} characters`);
    return this;
  }

  email() {
    this.refine(
      (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Invalid email address",
    );
    return this;
  }

  url() {
    this.refine((v) => {
      try {
        new URL(v);
        return true;
      } catch {
        return false;
      }
    }, "Invalid URL");
    return this;
  }

  regex(re: RegExp, message = "Does not match pattern") {
    this.refine((v) => re.test(v), message);
    return this;
  }

  trim() {
    this.transform((v) => v.trim());
    return this;
  }

  toLowerCase() {
    this.transform((v) => v.toLowerCase());
    return this;
  }

  toUpperCase() {
    this.transform((v) => v.toUpperCase());
    return this;
  }
}

/**
 * Number Schema
 */
class NumberSchema extends AxiomSchema<number> {
  protected _validate(data: unknown): ValidationResult<number> {
    return typeof data === "number" && !isNaN(data)
      ? { success: true, data }
      : { success: false, error: `Expected number, got ${typeof data}` };
  }

  min(n: number) {
    this.refine((v) => v >= n, `Must be greater than or equal to ${n}`);
    return this;
  }

  max(n: number) {
    this.refine((v) => v <= n, `Must be less than or equal to ${n}`);
    return this;
  }

  int() {
    this.refine((v) => Number.isInteger(v), "Must be an integer");
    return this;
  }

  positive() {
    return this.min(0);
  }

  negative() {
    return this.max(0);
  }
}

/**
 * Boolean Schema
 */
class BooleanSchema extends AxiomSchema<boolean> {
  protected _validate(data: unknown): ValidationResult<boolean> {
    return typeof data === "boolean"
      ? { success: true, data }
      : { success: false, error: `Expected boolean, got ${typeof data}` };
  }
}

/**
 * Any Schema
 */
class AnySchema extends AxiomSchema<any> {
  protected _validate(data: unknown): ValidationResult<any> {
    return { success: true, data };
  }
}

/**
 * Object Schema - Handles recursive validation of properties
 */
class ObjectSchema<T extends Record<string, Validator>> extends AxiomSchema<{
  [K in keyof T]: T[K]["_output"];
}> {
  constructor(private shape: T) {
    super();
  }

  protected _validate(
    data: unknown,
  ): ValidationResult<{ [K in keyof T]: T[K]["_output"] }> {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return { success: false, error: "Expected object" };
    }
    return { success: true, data: data as any };
  }

  async parse(data: unknown): Promise<{ [K in keyof T]: T[K]["_output"] }> {
    const base = await super.parse(data);
    const result: any = {};
    const errors: string[] = [];

    for (const key in this.shape) {
      try {
        result[key] = await this.shape[key].parse(base[key]);
      } catch (e: any) {
        errors.push(`${key}: ${e.message}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }

    return result;
  }
}

/**
 * Array Schema - Handles recursive validation of items
 */
class ArraySchema<T extends Validator> extends AxiomSchema<T["_output"][]> {
  constructor(private itemSchema: T) {
    super();
  }

  protected _validate(data: unknown): ValidationResult<T["_output"][]> {
    return Array.isArray(data)
      ? { success: true, data }
      : { success: false, error: "Expected array" };
  }

  min(n: number) {
    this.refine((v) => v.length >= n, `Must have at least ${n} items`);
    return this;
  }

  max(n: number) {
    this.refine((v) => v.length <= n, `Must have at most ${n} items`);
    return this;
  }

  length(n: number) {
    this.refine((v) => v.length === n, `Must have exactly ${n} items`);
    return this;
  }

  async parse(data: unknown): Promise<T["_output"][]> {
    const base = await super.parse(data);
    const result = await Promise.all(
      base.map((item, i) =>
        this.itemSchema.parse(item).catch((e: any) => {
          throw new Error(`[${i}]: ${e.message}`);
        }),
      ),
    );
    return result;
  }
}

/**
 * File Schema - Validates that the input is a standard File or Blob.
 */
class FileSchema extends AxiomSchema<File> {
  protected _validate(data: unknown): ValidationResult<File> {
    // Check if it's a native File or Blob object
    return data instanceof File || data instanceof Blob
      ? { success: true, data: data as File }
      : { success: false, error: "Expected File or Blob" };
  }

  max(sizeInBytes: number, message?: string) {
    return this.refine(
      (v) => v.size <= sizeInBytes,
      message || `File is too large (max ${sizeInBytes} bytes)`,
    );
  }

  min(sizeInBytes: number, message?: string) {
    return this.refine(
      (v) => v.size >= sizeInBytes,
      message || `File is too small (min ${sizeInBytes} bytes)`,
    );
  }

  type(mimeType: MimeType, message?: string) {
    return this.refine(
      (v) => v.type.startsWith(mimeType),
      message || `Invalid file type (expected ${mimeType})`,
    );
  }
}

/**
 * Common Mime Types for autocomplete
 */
export type MimeType =
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp"
  | "image/svg+xml"
  | "application/pdf"
  | "application/json"
  | "application/xml"
  | "application/zip"
  | "application/x-zip-compressed"
  | "application/octet-stream"
  | "text/plain"
  | "text/html"
  | "text/css"
  | "text/javascript"
  | "video/mp4"
  | "video/mpeg"
  | "audio/mpeg"
  | "audio/wav"
  | "image/"
  | "video/"
  | "audio/"
  | "text/"
  | "application/"
  | (string & {});

/**
 * The 's' export - The main library interface.
 */
export const s = {
  string: () => new StringSchema(),
  number: () => new NumberSchema(),
  boolean: () => new BooleanSchema(),
  any: () => new AnySchema(),
  object: <T extends Record<string, Validator>>(shape: T) =>
    new ObjectSchema(shape),
  array: <T extends Validator>(item: T) => new ArraySchema(item),
  file: () => new FileSchema(),
};

export default s;
