import { ZodBase } from "./base";
import type { CheckFunction } from "./types";

class ZodNumber extends ZodBase<number> {
  constructor(checks?: CheckFunction<number>[]) {
    super({
      typeCheck: (input: unknown) => typeof input === "number",
      typeErrorMessage: "input must be a number",
    });
    if (checks) this.checks.push(...checks); // copy array
  }

  clone(): this {
    return new ZodNumber(this.checks) as this;
  }

  gt(max: number) {
    return this.cloneAndAddCheck((num) =>
      num > max
        ? { success: true }
        : { success: false, errorMessage: `number must be greater then ${max}` }
    );
  }

  gte(max: number) {
    return this.cloneAndAddCheck((num) =>
      num >= max
        ? { success: true }
        : {
            success: false,
            errorMessage: `number must be greater then or equal to ${max}`,
          }
    );
  }

  lt(max: number) {
    return this.cloneAndAddCheck((num) =>
      num < max
        ? { success: true }
        : { success: false, errorMessage: `number must be less then ${max}` }
    );
  }

  lte(max: number) {
    return this.cloneAndAddCheck((num) =>
      num <= max
        ? { success: true }
        : {
            success: false,
            errorMessage: `number must be less then or equal to ${max}`,
          }
    );
  }

  positive() {
    return this.cloneAndAddCheck((num) =>
      num > 0
        ? { success: true }
        : { success: false, errorMessage: `number must be positive` }
    );
  }

  negative() {
    return this.cloneAndAddCheck((num) =>
      num < 0
        ? { success: true }
        : { success: false, errorMessage: `number must be negative` }
    );
  }

  nonpositive() {
    return this.cloneAndAddCheck((num) =>
      num <= 0
        ? { success: true }
        : { success: false, errorMessage: `number cannot be positive` }
    );
  }

  nonnegative() {
    return this.cloneAndAddCheck((num) =>
      num >= 0
        ? { success: true }
        : { success: false, errorMessage: `number cannot be negative` }
    );
  }

  multiple(n: number) {
    return this.cloneAndAddCheck((num) =>
      num % n == 0
        ? { success: true }
        : { success: false, errorMessage: `number must be a multiple of ${n}` }
    );
  }
}

const number = () => new ZodNumber();

export default number;
