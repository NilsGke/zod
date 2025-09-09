import { describe, expect, test } from "bun:test";
import { z } from "../src";
import { expectZodErrorMessage } from "./util";

describe("z.object()", () => {
  test("empty object", () => {
    expect(z.object({}).parse({})).toEqual({});
  });

  test("not a object", () => {
    expectZodErrorMessage(z.object({}).safeParse(161 as any)).toMatch(
      "input must be of type object, received: number"
    );
  });

  test("property", () => {
    expect(
      z
        .object({
          hello: z.string(),
        })
        .parse({ hello: "world" })
    ).toEqual({
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
      z.object({ hello: z.string() }).parse({ hello: "world", bye: "world" })
    ).toEqual({
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
        })
    ).toEqual({
      hello: "world",
      bye: "world",
    });
  });
  test("z.object().loose() also lets unexpected properties through", () => {
    expect(
      z
        .object({
          hello: z.string(),
        })
        .loose()
        .parse({
          hello: "world",
          bye: "world",
        })
    ).toEqual({
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
    ).toMatch('unexpected key "bye" in input');
  });
  test("z.object().strict() also throws on unexpected property", () => {
    expectZodErrorMessage(
      z
        .object({
          hello: z.string(),
        })
        .strict()
        .safeParse({
          hello: "world",
          bye: "world",
        } as any)
    ).toMatch('unexpected key "bye" in input');
  });
});

describe("z.object().catchall()", () => {
  test("lets keys through and succeeds", () => {
    expect(
      z
        .object({
          hello: z.string(),
        })
        .catchall(z.number())
        .parse({
          hello: "world",
          test: 69,
        })
    ).toEqual({
      hello: "world",
      test: 69,
    } as any);
  });

  test("error in base object", () => {
    expectZodErrorMessage(
      z
        .object({
          hello: z.string(),
        })
        .catchall(z.number())
        .safeParse({
          hello: true,
          test: 69,
        } as any)
    ).toMatch(
      'value of key "hello" resulted in an error:\n\tinput must be a string'
    );
  });

  test("throws on error on incorrect catch", () => {
    expectZodErrorMessage(
      z
        .object({
          hello: z.string(),
        })
        .catchall(z.number())
        .safeParse({
          hello: "world",
          test: true,
        })
    ).toMatch(
      /error in catchall schema for key: "test":\n\tinput must be a number/
    );
  });
});

describe("z.object().shape", () => {
  const a = z.string();
  const b = z.number();

  test("shape returns correct internal schema", () => {
    expect(z.object({ foo: a, bar: b }).shape.foo).toBe(a);
    expect(z.object({ foo: a, bar: b }).shape.bar).toBe(b);
  });
});

describe("z.object().keyof()", () => {
  test("keyof returns a enum with the correct keys", () => {
    const k = z.object({ foo: z.string(), bar: z.number() }).keyof();
    expect(k.parse("foo")).toMatch("foo");
    expect(k.parse("bar")).toMatch("bar");
    expectZodErrorMessage(k.safeParse("hello")).toMatch(
      'string must be one of the following: "foo", "bar"'
    );
  });
});

describe("z.object().extend()", () => {
  test("extend returns object with the new properties", () => {
    const a = z.string();
    const b = z.number();
    const k = z.object({ foo: a });
    expect(k.extend({ bar: b }).shape).toEqual({
      foo: a,
      bar: b,
    });
    expect(k.loose().extend({ bar: b }).shape).toEqual({
      foo: a,
      bar: b,
    });
    expect(k.strict().extend({ bar: b }).shape).toEqual({
      foo: a,
      bar: b,
    });
    expect(k.catchall(z.number()).extend({ bar: b }).shape).toEqual({
      foo: a,
      bar: b,
    });
  });

  test("extend by using spread syntax", () => {
    const a = z.string();
    const b = z.number();
    const c = z.boolean();

    const k = z.object({ foo: a });
    const l = z.object({ bar: b });

    expect(
      z.object({
        ...k.shape,
        ...l.shape,
        test: c,
      }).shape
    ).toEqual({
      foo: a,
      bar: b,
      test: c,
    });
  });
});
