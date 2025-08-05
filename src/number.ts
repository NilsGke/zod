import type { Check, CheckResult, ZodClass } from "./types";

class ZodNumber implements ZodClass<number> {
  _checks: Check<number>[] = [{ apply: this.baseCheck }];

  baseCheck(input: number): CheckResult<number> {
    return typeof input === "number" && !isNaN(input)
      ? { success: true, result: input }
      : { success: false, errorMessage: "input must be a number" };
  }

  gt(max: number) {
    this._checks.push({
      apply: (num) =>
        num > max
          ? { success: true, result: num }
          : {
              success: false,
              errorMessage: `number must be greater then ${max}`,
            },
    });
    return this;
  }

  gte(max: number) {
    this._checks.push({
      apply: (num) =>
        num >= max
          ? { success: true, result: num }
          : {
              success: false,
              errorMessage: `number must be greater then or equal to ${max}`,
            },
    });
    return this;
  }

  lt(max: number) {
    this._checks.push({
      apply: (num) =>
        num < max
          ? { success: true, result: num }
          : {
              success: false,
              errorMessage: `number must be less then ${max}`,
            },
    });
    return this;
  }

  lte(max: number) {
    this._checks.push({
      apply: (num) =>
        num <= max
          ? { success: true, result: num }
          : {
              success: false,
              errorMessage: `number must be less then or equal to ${max}`,
            },
    });
    return this;
  }

  positive() {
    this._checks.push({
      apply: (num) =>
        num > 0
          ? { success: true, result: num }
          : {
              success: false,
              errorMessage: `number must be positive`,
            },
    });
    return this;
  }

  negative() {
    this._checks.push({
      apply: (num) =>
        num < 0
          ? { success: true, result: num }
          : {
              success: false,
              errorMessage: `number must be negative`,
            },
    });
    return this;
  }

  nonpositive() {
    this._checks.push({
      apply: (num) =>
        num <= 0
          ? { success: true, result: num }
          : {
              success: false,
              errorMessage: `number cannot be positive`,
            },
    });
    return this;
  }

  nonnegative() {
    this._checks.push({
      apply: (num) =>
        num >= 0
          ? { success: true, result: num }
          : {
              success: false,
              errorMessage: `number cannot be negative`,
            },
    });
    return this;
  }

  multiple(n: number) {
    this._checks.push({
      apply: (num) =>
        num % n == 0
          ? { success: true, result: num }
          : {
              success: false,
              errorMessage: `number must be a multiple of ${n}`,
            },
    });
    return this;
  }

  parse(input: number) {
    const result = this.safeParse(input);
    if (result.success) return result.result;
    throw new Error(result.errorMessage);
  }

  safeParse(input: number): CheckResult<number> {
    let num = input;
    for (let check of this._checks) {
      const result = check.apply(num);
      if (!result.success) return result;
      else num = result.result;
    }

    return { success: true, result: num };
  }
}

const number = () => new ZodNumber();

export default number;
