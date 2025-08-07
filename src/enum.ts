import { ZodBaseClass } from "./base";
import type { CheckResult } from "./types";

type ExcludeFromArray<
  T extends readonly [...string[]],
  K extends readonly [...string[]]
> = Exclude<T[number], K[number]>[];

type ExtractFromArray<
  T extends readonly [...string[]],
  K extends readonly [...string[]]
> = Extract<T[number], K[number]>[];

class ZodEnum<T extends readonly [...string[]]> extends ZodBaseClass<
  T[number]
> {
  private validStrings: Set<string>;

  constructor(validStrings: T) {
    super(
      (input): input is string => typeof input === "string",
      "input must be a string"
    );

    this.validStrings = new Set(validStrings);

    this.addCheck(
      (input: string): CheckResult<string> =>
        this.validStrings.has(input)
          ? { success: true, result: input }
          : {
              success: false,
              errorMessage: `string must be one of the following: ${validStrings
                .map((s) => `"${s}"`)
                .join(", ")}`,
            }
    );
  }

  exclude<const K extends readonly [...string[]]>(disallowedStrings: K) {
    const newStrings = [...this.validStrings, ...disallowedStrings].filter(
      (s) => !disallowedStrings.includes(s)
    );
    return _enum(newStrings as ExcludeFromArray<T, K>);
  }

  extract<const K extends readonly [...string[]]>(allowedStrings: K) {
    const newStrings = [...this.validStrings].filter((s) =>
      allowedStrings.includes(s)
    ) as ExtractFromArray<T, K>;
    return _enum(newStrings);
  }

  // override parse and safeParse to make input accept strings instead of exact literal
  parse = (input: string) => super.parse(input as T[number]);
  safeParse = (input: string) => super.safeParse(input as T[number]);
}

const _enum = <const T extends [...string[]]>(values: T) => new ZodEnum(values);

export default _enum;
