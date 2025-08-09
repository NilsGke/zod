import type { Check, CheckResult } from "./types";

export class ZodBase<Input, Output = Input> {
  private readonly checks: Check<Input>[];
  private transformer?: (input: Input) => Output;

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
      this.checks = [
        (input: Input) =>
          baseCheck(input)
            ? { success: true, result: input }
            : { success: false, errorMessage },
      ];
    else this.checks = [];

    if (transformer) this.transformer = transformer;
  }

  addCheck(check: Check<Input>): void {
    this.checks.push(check);
  }

  parse(input: Input) {
    const result = this.safeParse(input);
    if (result.success) return result.result;
    throw new Error(result.errorMessage);
  }

  safeParse(input: Input): CheckResult<Output> {
    let value = input;
    for (let check of this.checks) {
      const checkRes = check(value);
      if (!checkRes.success) return checkRes;
      else value = checkRes.result;
    }

    if (this.transformer)
      return { success: true, result: this.transformer(value) };

    return { success: true, result: value as any as Output }; // need `as any as Ouput` since we cannot check in the type if a transformer has been set
  }
}
