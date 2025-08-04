import type { Check, CheckResult, ZodClass } from "./types";

interface StringCheck {
  apply: (str: string) => CheckResult<string>;
}

class ZodString implements ZodClass<string> {
  _checks: StringCheck[] = [{ apply: this.baseCheck }];

  baseCheck(input: string): CheckResult<string> {
    return typeof input === "string"
      ? { success: true, result: input }
      : { success: false, errorMessage: "input is not a string" };
  }

  min(length: number) {
    this._checks.push({
      apply: (str) =>
        str.length >= length
          ? { success: true, result: str }
          : {
              success: false,
              errorMessage: `string must be at least ${length} characters long`,
            },
    });
    return this;
  }

  max(length: number) {
    this._checks.push({
      apply: (str) =>
        str.length <= length
          ? { success: true, result: str }
          : {
              success: false,
              errorMessage: `string can be max ${length} characters long`,
            },
    });
    return this;
  }

  length(length: number) {
    this._checks.push({
      apply: (str) =>
        str.length == length
          ? { success: true, result: str }
          : {
              success: false,
              errorMessage: `string must be exactly ${length} characters long`,
            },
    });
    return this;
  }

  regex(regex: RegExp) {
    this._checks.push({
      apply: (str) =>
        regex.test(str)
          ? { success: true, result: str }
          : {
              success: false,
              errorMessage: `string does not match regex: ${regex}`,
            },
    });
    return this;
  }

  startsWith(string: string) {
    this._checks.push({
      apply: (str) =>
        str.startsWith(string)
          ? { success: true, result: str }
          : { success: false, errorMessage: `string must start with "${str}"` },
    });
    return this;
  }

  endsWith(string: string) {
    this._checks.push({
      apply: (str) =>
        str.endsWith(string)
          ? { success: true, result: str }
          : { success: false, errorMessage: `string must end with "${str}"` },
    });
    return this;
  }

  includes(string: string) {
    this._checks.push({
      apply: (str) =>
        str.includes(string)
          ? { success: true, result: str }
          : { success: false, errorMessage: `string must include "${str}"` },
    });
    return this;
  }

  uppercase() {
    this._checks.push({
      apply: (str) =>
        str === str.toUpperCase()
          ? { success: true, result: str }
          : { success: false, errorMessage: "string must be uppercase" },
    });
    return this;
  }

  lowercase() {
    this._checks.push({
      apply: (str) =>
        str === str.toLowerCase()
          ? { success: true, result: str }
          : { success: false, errorMessage: "string must be lowercase" },
    });
    return this;
  }

  parse(input: string) {
    const result = this.safeParse(input);
    if (result.success) return result.result;
    throw new Error(result.errorMessage);
  }

  safeParse(input: string): CheckResult<string> {
    let str = input;
    for (let check of this._checks) {
      const result = check.apply(str);
      if (!result.success) return result;
      else str = result.result;
    }

    return { success: true, result: str };
  }
}

const string = () => new ZodString();

export default string;
