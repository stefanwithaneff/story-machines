import { EffectParser } from "../effect-parser";

interface PayloadTest {
  tag: string;
  expectedPayload: object;
}

interface PayloadTestSuite {
  [testName: string]: PayloadTest;
}

const tests: PayloadTestSuite = {
  int: {
    tag: "@effect TEST key:3",
    expectedPayload: { key: 3 },
  },
  negativeInt: {
    tag: "@effect TEST key:-3",
    expectedPayload: { key: -3 },
  },
  float: {
    tag: "@effect TEST key:32.456",
    expectedPayload: { key: 32.456 },
  },
  negativeFloat: {
    tag: "@effect TEST key:-091.3245",
    expectedPayload: { key: -91.3245 },
  },
  boolean: {
    tag: "@effect TEST key:true",
    expectedPayload: { key: true },
  },
  string: {
    tag: '@effect TEST key:"hello how are you?"',
    expectedPayload: { key: "hello how are you?" },
  },
  array: {
    tag: '@effect TEST key:[92 , false,"tester", .233 ,-39]',
    expectedPayload: { key: [92, false, "tester", 0.233, -39] },
  },
  multipleKeys: {
    tag: '@effect TEST key:1 key2:"hello my name is" key3:true key4:[-39, 32.112, 4]',
    expectedPayload: {
      key: 1,
      key2: "hello my name is",
      key3: true,
      key4: [-39, 32.112, 4],
    },
  },
};

describe("Ink Effect Parser", () => {
  it("parses a paramless effect tag", () => {
    const tag = "@effect TEST_TYPE";

    const effect = EffectParser.tryParse(tag);

    expect(effect).toEqual({ type: "TEST_TYPE", payload: {} });
  });

  for (const [name, { tag, expectedPayload }] of Object.entries(tests)) {
    it(`parses an effect tag with parameter type ${name}`, () => {
      const effect = EffectParser.tryParse(tag);

      expect(effect.payload).toEqual(expectedPayload);
    });
  }
});
