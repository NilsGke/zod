import { describe, expect, test } from "bun:test";
import { z } from "../src";
import { expectZodErrorMessage } from "./util";

describe("z.nullable(z.string())", () => {
  test("accepts string", () => {
    expect(z.nullable(z.string()).parse("hello")).toBe("hello");
  });
  test("accepts null", () => {
    expect(z.nullable(z.string()).parse(null)).toBeNull();
  });
  test("does not accept undefined", () => {
    expectZodErrorMessage(
      z.nullable(z.string()).safeParse(undefined as any)
    ).toMatch(/input must be.+/);
  });
});

describe("z.nullable(z.string()).unwrap()", () => {
  test("accepts string", () => {
    expect(z.nullable(z.string()).unwarp().parse("hello")).toBe("hello");
  });

  test("does not accept null", () => {
    expectZodErrorMessage(
      z
        .nullable(z.string())
        .unwarp()
        .safeParse(null as any)
    ).toMatch(/input must be.+/);
  });
});
