import type { CheckFunction, Infer, Parse } from "./types";

export type Transformer<Input, Output> = (input: Input) => Output;

export abstract class ZodBase<Input, Output = Input, PrimitiveInput = Input> {
  protected readonly checks: CheckFunction<Input>[];
  protected transformer?: Transformer<Input, Output>;
  protected typeCheck?: CheckFunction<Input>;
  protected baseChecks: CheckFunction<Input>[];

  constructor(options?: {
    typeCheck: (val: unknown) => val is PrimitiveInput;
    typeErrorMessage: string | ((input: unknown) => string);
    baseChecks?: CheckFunction<Input>[];
    transformer?: Transformer<Input, Output>;
  }) {
    const errMsg =
      typeof options?.typeErrorMessage === "string"
        ? () => options?.typeErrorMessage as string
        : options?.typeErrorMessage;
    if (options?.typeCheck && errMsg)
      this.typeCheck = (input: Input) =>
        options.typeCheck && errMsg !== undefined && options.typeCheck(input)
          ? { success: true, result: input }
          : { success: false, errorMessage: errMsg(input) };

    this.checks = [];
    this.baseChecks = options?.baseChecks || [];

    if (options?.transformer) this.transformer = options.transformer;
  }

  abstract clone(): this;
  protected cloneAndAddCheck(check: CheckFunction<Input>): this {
    const clone = this.clone();
    clone.checks.push(check);
    return clone;
  }

  optional() {
    return new ZodOptional(this);
  }

  get __checks() {
    return this.checks;
  }

  /** internal method to add checks to zod element from the outside */
  __addChecks = (check: CheckFunction<Input>[]) => this.checks.push(...check);

  /** internal method to aply the transformers to a input value */
  __transform(input: Input): Output {
    let value = input;
    // apply final transformer
    if (this.transformer) return this.transformer(value);
    else return value as Output extends Input ? Output : never;
  }

  parse(input: Input) {
    const result = this.safeParse(input);
    if (result.success) return result.result;
    throw new Error(result.errorMessage);
  }

  safeParse(input: Input): Parse.Result<Output> {
    let value = input;

    const checks = [
      ...(this.typeCheck ? [this.typeCheck] : []), // cannot just add typeCheck because we otherwise we need to filter out undefined from array
      ...this.baseChecks,
      ...this.checks,
    ];

    for (let check of checks) {
      const checkRes = check(value);
      if (!checkRes.success) return checkRes;
    }

    const output = this.__transform(value);

    return { success: true, result: output };
  }
}

export class ZodOptional<Schema extends ZodBase<any>> extends ZodBase<
  Infer<Schema> | undefined
> {
  private baseSchema: Schema;

  constructor(schema: Schema) {
    super();
    this.baseSchema = schema;

    this.baseChecks.push((input) => {
      if (input === undefined)
        return {
          success: true,
          result: input,
        };
      return schema.safeParse(input);
    });
  }

  clone() {
    throw Error("clone should not be used on this class");
    return this;
  }

  unwarp() {
    return this.baseSchema;
  }
}

export const optional = <S extends ZodBase<any>>(schema: S) =>
  new ZodOptional(schema);

class ZodNullable<T, K extends ZodBase<T>> extends ZodBase<T | null> {
  private baseSchema: K;

  constructor(schema: K) {
    super();
    this.baseSchema = schema;

    this.checks.push((input) => {
      if (input === null)
        return {
          success: true,
          result: input,
        };
      return schema.safeParse(input);
    });
  }

  clone() {
    throw Error("clone should not be used on this class");
    return this;
  }

  unwarp() {
    return this.baseSchema;
  }
}

export const nullable = <S extends ZodBase<any>>(schema: S) =>
  new ZodNullable<ReturnType<S["parse"]>, S>(schema);

class ZodNullish<T, K extends ZodBase<T>> extends ZodBase<
  T | null | undefined
> {
  private baseSchema: K;

  constructor(schema: K) {
    super();
    this.baseSchema = schema;

    this.checks.push((input) => {
      if (input === null || input === undefined)
        return {
          success: true,
          result: input,
        };
      return schema.safeParse(input);
    });
  }

  clone() {
    throw Error("clone should not be used on this class");
    return this;
  }

  unwarp() {
    return this.baseSchema;
  }
}

export const nullish = <S extends ZodBase<any>>(schema: S) =>
  new ZodNullish<ReturnType<S["parse"]>, S>(schema);
