import boolean from "./boolean";
import number from "./number";
import string from "./string";
import _enum from "./enum";
import type { Infer as _Infer } from "./types";
import type { ZodBaseClass } from "./base";

export const z = { string, number, boolean, enum: _enum };

export namespace z {
  export type infer<T extends ZodBaseClass<any>> = _Infer<T>;
}
