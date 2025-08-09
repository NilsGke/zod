import { describe, expect, test } from "bun:test";
import { z } from "../src";

describe("z.unknown()", () => {
  test("accepts different things", () => {
    expect(z.unknown().parse("hello")).toBe("hello");
    expect(z.unknown().parse(2)).toBe(2);
    expect(z.unknown().parse(undefined)).toBe(undefined);
    expect(z.unknown().parse(null)).toBe(null);
  });
});
