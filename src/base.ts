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
