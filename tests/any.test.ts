import { describe, expect, test } from "bun:test";
import { z } from "../src";

describe("z.any()", () => {
  test("accepts different things", () => {
    expect(z.any().parse("hello")).toBe("hello");
    expect(z.any().parse(2)).toBe(2);
    expect(z.any().parse(undefined)).toBe(undefined);
    expect(z.any().parse(null)).toBe(null);
  });
});
