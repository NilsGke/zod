import type { Check, CheckResult } from "./types";

export class ZodBaseClass<T> {
  private readonly checks: Check<T>[];

  constructor(baseCheck: (val: unknown) => val is T, errorMessage: string) {
    this.checks = [
      {
        apply: (input: T) =>
          baseCheck(input)
            ? { success: true, result: input }
            : { success: false, errorMessage },
      },
    ];
  }

  addCheck(check: Check<T>): void {
    this.checks.push(check);
  }

  parse(input: T) {
    const result = this.safeParse(input);
    if (result.success) return result.result;
    throw new Error(result.errorMessage);
  }

  safeParse(input: T): CheckResult<T> {
    let num = input;
    for (let check of this.checks) {
      const checkRes = check.apply(num);
      if (!checkRes.success) return checkRes;
      else num = checkRes.result;
    }

    return { success: true, result: num };
  }
}
