import type { Infer as _Infer } from "./types";
import type { ZodBase } from "./base";
import boolean from "./boolean";
import number from "./number";
import string from "./string";
import _enum from "./enum";
import stringbool from "./stringbool";

export const z = { string, number, boolean, enum: _enum, stringbool };

export namespace z {
  export type infer<T extends ZodBase<any>> = _Infer<T>;
}
