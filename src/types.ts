import type { ZodBase } from "./base";

export type CheckFunction<T> = (input: T) => Check.Result;
export type TransformerFunction<T, K = T> = (input: T) => K;

export namespace Check {
  export interface SuccessfulResult {
    success: true;
  }
  export interface FailedResult {
    success: false;
    errorMessage: string;
  }
  export type Result = SuccessfulResult | FailedResult;
}

export namespace Parse {
  export interface SuccessfulResult<T> {
    success: true;
    result: T;
  }
  export interface FailedResult {
    success: false;
    errorMessage: string;
  }
  export type Result<T> = SuccessfulResult<T> | FailedResult;
}

export type Infer<T extends ZodBase<any>> = ReturnType<T["parse"]>;
