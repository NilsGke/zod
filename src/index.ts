import type { Infer as _Infer } from "./types";
import { type ZodBase, optional, nullable, nullish } from "./base";
import boolean from "./boolean";
import number from "./number";
import string from "./string";
import _enum from "./enum";
import stringbool from "./stringbool";
import unknown from "./unknown";
import any from "./any";
import never from "./never";
import { object, looseObject, strictObject } from "./object";

export const z = {
  string,
  number,
  boolean,
  enum: _enum,
  stringbool,
  optional,
  nullable,
  nullish,
  unknown,
  any,
  never,
  object,
  looseObject,
  strictObject,
};

export namespace z {
  export type infer<T extends ZodBase<any>> = _Infer<T>;
}
