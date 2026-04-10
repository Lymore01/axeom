/**
 * Axeom Schema
 * A zero-dependency, ultra-lightweight validation library.
 */

type ValidationResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Standard Validator interface for Axeom.
 */
export interface Validator<T = any> {
  readonly _output: T;
  readonly _isOptional?: boolean;
  parse: (data: unknown) => T | Promise<T>;
}

/**
 * Infer the type of an Axeom Schema.
 */
export type Infer<S> = S extends Validator<infer T> ? T : never;

/**
 * Base Schema class providing chainable modifiers for all schema types.
 */
export abstract class AxeomSchema<T> implements Validator<T> {
  readonly _output!: T;
  readonly _isOptional!: boolean;

  protected _isOptionalVal = false;
  protected _isNullable = false;
  protected _defaultValue?: T;
  protected _transforms: Array<(data: any) => any> = [];

  /**
   * Generates a standard JSON Schema representation of the validator.
   */
  abstract toJSONSchema(): any;

  protected abstract _validate(data: unknown): ValidationResult<T>;

  /**
   * Validates and parses the input data, applying all transforms and refinements.
   * Throws an error if validation fails.
   */
  async parse(data: unknown): Promise<T> {
    // Handle missing / null values
    if (data === undefined) {
      if (this._defaultValue !== undefined) data = this._defaultValue;
      else if (this._isOptionalVal) return undefined as any;
      else throw new Error("Required field is missing");
    }

    if (data === null) {
      if (this._isNullable) return null as any;
      throw new Error("Field cannot be null");
    }

    // Perform Type Validation
    const result = this._validate(data);
    if (!result.success) throw new Error(result.error);

    // Apply Transforms/Refinements
    let finalData = result.data;
    for (const transform of this._transforms) {
      finalData = await transform(finalData);
    }
    return finalData;
  }

  /**
   * Marks the field as optional, allowing 'undefined' inputs.
   */
  optional(): this & { readonly _isOptional: true; readonly _output: T | undefined } {
    this._isOptionalVal = true;
    return this as any;
  }

  /**
   * Marks the field as nullable, allowing 'null' inputs.
   */
  nullable(): this & { readonly _output: T | null } {
    this._isNullable = true;
    return this as any;
  }

  /**
   * Sets a default value if the input is missing.
   */
  default(val: T): this {
    this._defaultValue = val;
    return this;
  }

  /**
   * Transforms the validated output into a new value or type.
   */
  transform<U>(fn: (data: T) => U | Promise<U>): AxeomSchema<U> & this {
    this._transforms.push(fn);
    return this as any;
  }

  /**
   * Adds a custom validation check. Throws if the function returns false.
   */
  refine(fn: (data: T) => boolean | Promise<boolean>, message = "Invalid value"): this {
    return this.transform(async (data) => {
      if (!(await fn(data))) throw new Error(message);
      return data;
    }) as any;
  }
}

/**
 * String Schema
 */
class StringSchema extends AxeomSchema<string> {
  protected _validate(data: unknown): ValidationResult<string> {
    return typeof data === "string"
      ? { success: true, data }
      : { success: false, error: `Expected string, got ${typeof data}` };
  }

  toJSONSchema() {
    return {
      type: "string",
      ...(this._isOptionalVal ? { optional: true } : {}),
      ...(this._isNullable ? { nullable: true } : {}),
      ...(this._defaultValue !== undefined ? { default: this._defaultValue } : {}),
    };
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
    this.refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Invalid email address");
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
class NumberSchema extends AxeomSchema<number> {
  protected _validate(data: unknown): ValidationResult<number> {
    return typeof data === "number"
      ? { success: true, data }
      : { success: false, error: `Expected number, got ${typeof data}` };
  }

  toJSONSchema() {
    return {
      type: "number",
      ...(this._isOptionalVal ? { optional: true } : {}),
      ...(this._isNullable ? { nullable: true } : {}),
      ...(this._defaultValue !== undefined ? { default: this._defaultValue } : {}),
    };
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
class BooleanSchema extends AxeomSchema<boolean> {
  protected _validate(data: unknown): ValidationResult<boolean> {
    return typeof data === "boolean"
      ? { success: true, data }
      : { success: false, error: `Expected boolean, got ${typeof data}` };
  }

  toJSONSchema() {
    return {
      type: "boolean",
      ...(this._isOptionalVal ? { optional: true } : {}),
      ...(this._isNullable ? { nullable: true } : {}),
      ...(this._defaultValue !== undefined ? { default: this._defaultValue } : {}),
    };
  }
}

/**
 * Any Schema
 */
class AnySchema extends AxeomSchema<any> {
  protected _validate(data: unknown): ValidationResult<any> {
    return { success: true, data };
  }

  toJSONSchema() {
    return { type: "any" };
  }
}

/**
 * Enum Schema - Validates that the input is one of a specific set of strings.
 */
class EnumSchema<T extends string> extends AxeomSchema<T> {
  constructor(private values: T[]) {
    super();
  }
  protected _validate(data: unknown): ValidationResult<T> {
    return typeof data === "string" && this.values.includes(data as T)
      ? { success: true, data: data as T }
      : {
          success: false,
          error: `Invalid value. Expected one of: ${this.values.join(", ")}`,
        };
  }

  toJSONSchema() {
    return {
      type: "string",
      enum: this.values,
    };
  }
}

/**
 * Type to correctly infer optional vs required properties in an object schema.
 */
export type InferObject<T extends Record<string, Validator>> = {
  [K in keyof T as T[K] extends { _isOptional: true } ? never : K]: T[K]["_output"];
} & {
  [K in keyof T as T[K] extends { _isOptional: true } ? K : never]?: T[K]["_output"];
};

/**
 * Object Schema - Handles recursive validation of properties
 */
class ObjectSchema<T extends Record<string, Validator>> extends AxeomSchema<InferObject<T>> {
  constructor(private shape: T) {
    super();
  }

  protected _validate(data: unknown): ValidationResult<InferObject<T>> {
    return typeof data === "object" && data !== null
      ? { success: true, data: data as InferObject<T> }
      : { success: false, error: "Expected object" };
  }

  toJSONSchema() {
    const properties: any = {};
    for (const key in this.shape) {
      properties[key] = (this.shape[key] as any).toJSONSchema();
    }
    return {
      type: "object",
      properties,
      required: Object.keys(this.shape).filter((key) => !(this.shape[key] as any)._isOptionalVal),
    };
  }

  async parse(data: unknown): Promise<InferObject<T>> {
    const base = (await super.parse(data)) as any;
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

    return result as InferObject<T>;
  }
}

/**
 * Array Schema - Handles recursive validation of items
 */
class ArraySchema<T extends Validator> extends AxeomSchema<T["_output"][]> {
  constructor(private itemSchema: T) {
    super();
  }
  protected _validate(data: unknown): ValidationResult<T["_output"][]> {
    return Array.isArray(data)
      ? { success: true, data }
      : { success: false, error: "Expected array" };
  }

  toJSONSchema() {
    return {
      type: "array",
      items: (this.itemSchema as any).toJSONSchema(),
    };
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
class FileSchema extends AxeomSchema<File> {
  protected _validate(data: unknown): ValidationResult<File> {
    return data instanceof File || data instanceof Blob
      ? { success: true, data: data as File }
      : { success: false, error: "Expected File or Blob" };
  }

  toJSONSchema() {
    return {
      type: "string",
      format: "binary",
    };
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
 * The main library interface.
 * Use this to create new schema validators.
 */
export const s = {
  /** Create a string validator */
  string: () => new StringSchema(),
  /** Create a number validator */
  number: () => new NumberSchema(),
  /** Create a boolean validator */
  boolean: () => new BooleanSchema(),
  /** Create a validator that allows any input */
  any: () => new AnySchema(),
  /** Create an enum validator from an array of strings */
  enum: <T extends string>(values: T[]) => new EnumSchema(values),
  /** Create an object validator from a shape record */
  object: <T extends Record<string, Validator>>(shape: T) => new ObjectSchema(shape),
  /** Create an array validator for a specific item type */
  array: <T extends Validator>(item: T) => new ArraySchema(item),
  /** Create a file/blob validator */
  file: () => new FileSchema(),
};

export default s;
