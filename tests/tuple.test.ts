import { describe, test, expect } from "bun:test";
import { z } from "../src";
import { expectZodErrorMessage } from "./util";

describe("z.tuple()", () => {
  test("default behavior", () => {
    expect(
      z.tuple([z.string(), z.number()]).parse(["test", 1234]),
    ).toMatchObject(["test", 1234]);
    expectZodErrorMessage(
      z.tuple([z.string(), z.number()]).safeParse(["foo", "bar" as any]),
    ).toMatch(/incorrect tuple value.+/);
  });

  test("empty tuple argument", () => {
    expect(() => z.tuple([] as any)).toThrowError(
      "tuple schemas must have at least one item",
    );
  });
});
