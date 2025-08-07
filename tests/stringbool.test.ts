import { describe, expect, test } from "bun:test";
import { z } from "../src";
import { expectZodErrorMessage } from "./util";

describe("z.stringbool()", () => {
  test("truty value", () => {
    expect(z.stringbool().parse("yes")).toBe(true);
  });

  test("falsy value", () => {
    expect(z.stringbool().parse("no")).toBe(false);
  });

  test("incorrect value", () => {
    expectZodErrorMessage(z.stringbool().safeParse("i dont know")).toMatch(
      /input must be one of.+/
    );
  });

  test("custom values", () => {
    const custom = z.stringbool({
      truthy: ["ja", "oui"],
      falsy: ["nein", "non"],
    });

    test("correct value", () => {
      expect(custom.parse("ja")).toBe(true);
      expect(custom.parse("non")).toBe(false);
    });

    test("incorrect value", () => {
      expectZodErrorMessage(custom.safeParse("si")).toMatch(
        /input must be one of.+/
      );
    });

    test("incorrect value (from original values)", () => {
      expectZodErrorMessage(custom.safeParse("yes")).toMatch(
        /input must be one of.+/
      );
    });

    test("case sensitive", () => {
      expectZodErrorMessage(
        z
          .stringbool({
            truthy: ["ja"],
            case: "sensitive",
          })
          .safeParse("JA")
      ).toMatch(/input must be one of:.+/);
      expect(
        z.stringbool({ truthy: ["ja"], case: "sensitive" }).parse("ja")
      ).toBe(true);
      expect(
        z.stringbool({ truthy: ["ja"], case: "sensitive" }).parse("ja")
      ).toBe(true);
    });
  });
});
