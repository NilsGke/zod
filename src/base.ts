import type { Check, CheckResult } from "./types";

export abstract class ZodBase<Input, Output = Input> {
  protected readonly checks: Check<Input>[];
  protected transformer?: (input: Input) => Output;
  protected baseCheck?: Check<Input>;

  constructor();
  constructor(baseCheck: (val: unknown) => val is Input, errorMessage: string);
  constructor(
    baseCheck: (val: unknown) => val is Input,
    errorMessage: string,
    transformer: (input: Input) => Output
  );

  constructor(
    baseCheck?: (val: unknown) => val is Input,
    errorMessage?: string,
    transformer?: typeof this.transformer
  ) {
    if (baseCheck && errorMessage)
      this.baseCheck = (input: Input) =>
        baseCheck(input)
          ? { success: true, result: input }
          : { success: false, errorMessage };

    this.checks = [];

    if (transformer) this.transformer = transformer;
  }

  protected abstract clone(): this;
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
    for (let check of this.baseCheck
      ? [this.baseCheck, ...this.checks]
      : this.checks) {
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

    this.checks.push((input) => {
      if (input === undefined)
        return {
          success: true,
          result: input,
        };
      return schema.safeParse(input);
    });
  }

  protected clone() {
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

  protected clone() {
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

  protected clone() {
    throw Error("clone should not be used on this class");
    return this;
  }

  unwarp() {
    return this.baseSchema;
  }
}

export const nullish = <S extends ZodBase<any>>(schema: S) =>
  new ZodNullish<ReturnType<S["parse"]>, S>(schema);
