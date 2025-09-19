import { ZodBase } from "./base";
import type { CheckFunction, Check } from "./types";

type ExcludeFromArray<
  T extends readonly [...string[]],
  K extends readonly [...string[]]
> = Exclude<T[number], K[number]>[];

type ExtractFromArray<
  T extends readonly [...string[]],
  K extends readonly [...string[]]
> = Extract<T[number], K[number]>[];

export class ZodEnum<T extends readonly [...string[]]> extends ZodBase<
  T[number]
> {
  private validStrings: Set<string>;

  constructor(validStrings: T, checks?: CheckFunction<T[number]>[]) {
    super({
      typeCheck: (input): input is string => typeof input === "string",
      typeErrorMessage: "input must be a string",
    });

    this.validStrings = new Set(validStrings);

    this.checks.push(
      (input: string): Check.Result =>
        this.validStrings.has(input)
          ? { success: true }
          : {
              success: false,
              errorMessage: `string must be one of the following: ${validStrings
                .map((s) => `"${s}"`)
                .join(", ")}`,
            }
    );
    if (checks) this.checks.push(...checks);
  }

  clone(): this {
    throw Error("clone should never be used on ZodEnum");
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

  // override parse and safeParse to make input accept literals and any string
  parse = (input: T[number] | (string & {})) => super.parse(input as T[number]);
  safeParse = (input: T[number] | (string & {})) =>
    super.safeParse(input as T[number]);
}

const _enum = <const T extends [...string[]]>(values: T) => new ZodEnum(values);

export default _enum;
