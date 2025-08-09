import { ZodBase } from "./base";
import { type Check, type CheckResult } from "./types";

class ZodString extends ZodBase<string> {
  constructor(checks?: Check<string>[]) {
    super(
      (input: unknown) => typeof input === "string",
      "input must be a string"
    );

    if (checks) this.checks.push(...checks);
  }

  protected clone() {
    return new ZodString(this.checks.slice()) as this;
  }

  min(length: number) {
    return this.cloneAndAddCheck((str) =>
      str.length >= length
        ? { success: true, result: str }
        : {
            success: false,
            errorMessage: `string must be at least ${length} characters long`,
          }
    );
  }

  max(length: number) {
    return this.cloneAndAddCheck((str) =>
      str.length <= length
        ? { success: true, result: str }
        : {
            success: false,
            errorMessage: `string can be max ${length} characters long`,
          }
    );
  }

  length(length: number) {
    return this.cloneAndAddCheck((str) =>
      str.length == length
        ? { success: true, result: str }
        : {
            success: false,
            errorMessage: `string must be exactly ${length} characters long`,
          }
    );
  }

  regex(regex: RegExp) {
    return this.cloneAndAddCheck((str) =>
      regex.test(str)
        ? { success: true, result: str }
        : {
            success: false,
            errorMessage: `string does not match regex: ${regex}`,
          }
    );
  }

  startsWith(string: string) {
    return this.cloneAndAddCheck((str) =>
      str.startsWith(string)
        ? { success: true, result: str }
        : { success: false, errorMessage: `string must start with "${str}"` }
    );
  }

  endsWith(string: string) {
    return this.cloneAndAddCheck((str) =>
      str.endsWith(string)
        ? { success: true, result: str }
        : { success: false, errorMessage: `string must end with "${str}"` }
    );
  }

  includes(string: string) {
    return this.cloneAndAddCheck((str) =>
      str.includes(string)
        ? { success: true, result: str }
        : { success: false, errorMessage: `string must include "${str}"` }
    );
  }

  uppercase() {
    return this.cloneAndAddCheck((str) =>
      str === str.toUpperCase()
        ? { success: true, result: str }
        : { success: false, errorMessage: "string must be uppercase" }
    );
  }

  lowercase() {
    return this.cloneAndAddCheck((str) =>
      str === str.toLowerCase()
        ? { success: true, result: str }
        : { success: false, errorMessage: "string must be lowercase" }
    );
  }
}

const string = () => new ZodString();

export default string;
