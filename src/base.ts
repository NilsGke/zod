import type { Check, CheckResult } from "./types";

type Transformer<Input, Output> = (input: Input) => Output;

export abstract class ZodBase<Input, Output = Input> {
  protected readonly checks: Check<Input>[];
  protected transformer?: Transformer<Input, Output>;
  protected typeCheck?: Check<Input>;
  protected baseChecks: Check<Input>[];

  constructor(options?: {
    typeCheck: (val: unknown) => val is Input;
    typeErrorMessage?: string;
    baseChecks?: Check<Input>[];
    transformer?: Transformer<Input, Output>;
  }) {
    const errMsg = options?.typeErrorMessage;
    if (options?.typeCheck && errMsg)
      this.typeCheck = (input: Input) =>
        options.typeCheck &&
        options?.typeErrorMessage &&
        options.typeCheck(input)
          ? { success: true, result: input }
          : { success: false, errorMessage: errMsg };

    this.checks = [];
    this.baseChecks = options?.baseChecks || [];

    if (options?.transformer) this.transformer = options.transformer;
  }

  abstract clone(): this;
  protected cloneAndAddCheck(check: Check<Input>): this {
    const clone = this.clone();
    clone.checks.push(check);
    return clone;
  }

  optional() {
    return new ZodOptional(this);
  }

  parse(input: Input) {
    const result = this.safeParse(input);
    if (result.success) return result.result;
    throw new Error(result.errorMessage);
  }

  safeParse(input: Input): CheckResult<Output> {
    let value = input;

    const checks = [
      ...(this.typeCheck ? [this.typeCheck] : []), // cannot just add typeCheck because we otherwise we need to filter out undefined from array
      ...this.baseChecks,
      ...this.checks,
    ];

    for (let check of checks) {
      const checkRes = check(value);
      if (!checkRes.success) return checkRes;
      else value = checkRes.result;
    }

    if (this.transformer)
      return { success: true, result: this.transformer(value) };

    return { success: true, result: value as any as Output }; // need `as any as Ouput` since we cannot check in the type if a transformer has been set
  }
}

export class ZodOptional<T, K extends ZodBase<T>> extends ZodBase<
  T | undefined
> {
  private baseSchema: K;

  constructor(schema: K) {
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
  new ZodOptional<ReturnType<S["parse"]>, S>(schema);

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
