export interface Check<T> {
  apply: (input: T) => CheckResult<T>;
}

export interface SuccessfulResult<T> {
  success: true;
  result: T;
}
export interface FailedResult {
  success: false;
  errorMessage: string;
}

export type CheckResult<T> = SuccessfulResult<T> | FailedResult;

export interface ZodClass<T> {
  baseCheck: Check<T>;
}
