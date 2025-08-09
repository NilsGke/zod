import { describe, expect, test } from "bun:test";
import { z } from "../src";
import { expectZodErrorMessage } from "./util";

describe("z.object()", () => {
  test("empty object", () => {
    expect(z.object({}).parse({})).toMatchObject({});
  });

  test("property", () => {
    expect(
      z
        .object({
          hello: z.string(),
        })
        .parse({ hello: "world" })
    ).toMatchObject({
      hello: "world",
    });
  });

  test("property error", () => {
    expectZodErrorMessage(
      z.object({ hello: z.string() }).safeParse({ hello: 3 } as any)
    ).toMatch(/value of key "hello" resulted in an error:\n\t.+/);

    expectZodErrorMessage(
      z.object({ hello: z.string().max(3) }).safeParse({ hello: "world" })
    ).toMatch(/value of key "hello" resulted in an error:\n\t.+/);
  });

  test("missing property", () => {
    expectZodErrorMessage(
      z
        .object({
          hello: z.string(),
        })
        .safeParse({} as any)
    ).toMatch(/input is missing key: "hello"/);
  });

  test("strips unexpected property", () => {
    expect(
      z
        .object({ hello: z.string() })
        .parse({ hello: "world", bye: "world" } as any)
    ).toMatchObject({
      hello: "world",
    });
  });
});

describe("z.looseObject()", () => {
  test("lets unexpected properties through", () => {
    expect(
      z
        .looseObject({
          hello: z.string(),
        })
        .parse({
          hello: "world",
          bye: "world",
        } as any)
    ).toMatchObject({
      hello: "world",
      bye: "world",
    });
  });
});

describe("z.strictObject()", () => {
  test("throws on unexpected property", () => {
    expectZodErrorMessage(
      z
        .strictObject({
          hello: z.string(),
        })
        .safeParse({
          hello: "world",
          bye: "world",
        } as any)
    ).toMatch('unexpected keys "bye" in input');
  });
});
