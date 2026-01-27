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

  test("too few parameters", () =>
    expect(() =>
      z.tuple([z.string(), z.number()]).parse(["foo"] as any),
    ).toThrowError("tuple is missing at least one element"));

  test("too many parameters", () =>
    expect(() =>
      z
        .tuple([z.string(), z.number()])
        .parse(["foo", 1234, false, null] as any),
    ).toThrowError("tuple has more elements then allowed"));

  test("empty tuple argument", () => {
    expect(() => z.tuple([] as any)).toThrowError(
      "tuple schemas must have at least one item",
    );
  });
});

describe("z.tuple([...], rest)", () => {
  test("rest passes", () => {
    expect(() =>
      z.tuple([z.string()], z.number()).parse(["foo", 1234, 9876]),
    ).toThrowError(/incorrect tuple rest value./);
  });

  test("rest throws", () => {
    expect(() =>
      z.tuple([z.string()], z.number()).parse(["foo", 1234, "bar" as any]),
    ).toThrowError(/incorrect tuple rest value.*/);
  });
});
