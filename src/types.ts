import type { ZodBase } from "./base";

export type Check<T> = (input: T) => CheckResult<T>;
export type TransformerFun<T, K> = (input: T) => K;

export interface SuccessfulResult<T> {
  success: true;
  result: T;
}
export interface FailedResult {
  success: false;
  errorMessage: string;
}

export type CheckResult<T> = SuccessfulResult<T> | FailedResult;

export type Infer<T extends ZodBase<any>> = ReturnType<T["parse"]>;
