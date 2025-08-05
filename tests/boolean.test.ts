import { describe, expect, test } from "bun:test";
import { expectZodErrorMessage } from "./util";
import { z } from "../src";

describe("z.boolean()", () => {
  test("not a boolean", () => {
    expectZodErrorMessage(z.boolean().safeParse("string" as any)).toMatch(
      /input must be a boolean/
    );
  });
  test("boolean", () => {
    expect(z.boolean().parse(true)).toBe(true);
    expect(z.boolean().parse(false)).toBe(false);
  });
});
