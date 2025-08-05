import { ZodBaseClass } from "./base";
import type { CheckResult } from "./types";

class ZodEnum<T extends readonly [string, ...string[]]> extends ZodBaseClass<
  T[number]
> {
  constructor(validStrings: T) {
    super(
      (input): input is string => typeof input === "string",
      "input must be a string"
    );

    this.addCheck({
      apply: (input: string): CheckResult<string> =>
        validStrings.includes(input)
          ? { success: true, result: input }
          : {
              success: false,
              errorMessage: `string must be one of the following: ${validStrings
                .map((s) => `"${s}"`)
                .join(", ")}`,
            },
    });
  }

  // override parse and safeParse to make input accept strings instead of exact literal
  parse = (input: string) => super.parse(input as T[number]);
  safeParse = (input: string) => super.safeParse(input as T[number]);
}

const _enum = <const T extends [string, ...string[]]>(values: T) =>
  new ZodEnum(values);

export default _enum;
