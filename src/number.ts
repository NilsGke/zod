import { ZodBaseClass } from "./base";

class ZodNumber extends ZodBaseClass<number> {
  constructor() {
    super(
      (input: unknown) => typeof input === "number",
      "input must be a number"
    );
  }

  gt(max: number) {
    this.addCheck({
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
    this.addCheck({
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
    this.addCheck({
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
    this.addCheck({
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
    this.addCheck({
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
    this.addCheck({
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
    this.addCheck({
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
    this.addCheck({
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
    this.addCheck({
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
}

const number = () => new ZodNumber();

export default number;
