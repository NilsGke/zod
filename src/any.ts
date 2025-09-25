import { ZodBase } from "./base";

export class ZodAny extends ZodBase<any> {
  clone() {
    throw Error("clone should not be used on this class");
    return this;
  }
}

const any = () => new ZodAny();
export default any;
