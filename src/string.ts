import { ZodBase } from "./base";
import { type CheckResult } from "./types";

class ZodString extends ZodBase<string> {
  constructor() {
    super(
      (input: unknown) => typeof input === "string",
      "input must be a string"
    );
  }

  _baseCheck(input: string): CheckResult<string> {
    return typeof input === "string"
      ? { success: true, result: input }
      : { success: false, errorMessage: "input must be a string" };
  }

  min(length: number) {
    this.addCheck((str) =>
      str.length >= length
        ? { success: true, result: str }
        : {
            success: false,
            errorMessage: `string must be at least ${length} characters long`,
          }
    );
    return this;
  }

  max(length: number) {
    this.addCheck((str) =>
      str.length <= length
        ? { success: true, result: str }
        : {
            success: false,
            errorMessage: `string can be max ${length} characters long`,
          }
    );
    return this;
  }

  length(length: number) {
    this.addCheck((str) =>
      str.length == length
        ? { success: true, result: str }
        : {
            success: false,
            errorMessage: `string must be exactly ${length} characters long`,
          }
    );
    return this;
  }

  regex(regex: RegExp) {
    this.addCheck((str) =>
      regex.test(str)
        ? { success: true, result: str }
        : {
            success: false,
            errorMessage: `string does not match regex: ${regex}`,
          }
    );
    return this;
  }

  startsWith(string: string) {
    this.addCheck((str) =>
      str.startsWith(string)
        ? { success: true, result: str }
        : { success: false, errorMessage: `string must start with "${str}"` }
    );
    return this;
  }

  endsWith(string: string) {
    this.addCheck((str) =>
      str.endsWith(string)
        ? { success: true, result: str }
        : { success: false, errorMessage: `string must end with "${str}"` }
    );
    return this;
  }

  includes(string: string) {
    this.addCheck((str) =>
      str.includes(string)
        ? { success: true, result: str }
        : { success: false, errorMessage: `string must include "${str}"` }
    );
    return this;
  }

  uppercase() {
    this.addCheck((str) =>
      str === str.toUpperCase()
        ? { success: true, result: str }
        : { success: false, errorMessage: "string must be uppercase" }
    );
    return this;
  }

  lowercase() {
    this.addCheck((str) =>
      str === str.toLowerCase()
        ? { success: true, result: str }
        : { success: false, errorMessage: "string must be lowercase" }
    );
    return this;
  }
}

const string = () => new ZodString();

export default string;
