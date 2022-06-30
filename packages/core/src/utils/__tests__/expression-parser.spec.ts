import { Context } from "../../types";
import { SCOPES } from "../../machines/context";
import { createEmptyContext } from "../create-empty-context";
import {
  evalAndReplace,
  ExpressionParser,
  parseAll,
  replaceWithParsedExpressions,
} from "../expression-parser";

interface Test {
  input: string;
  context?: Partial<Context>;
  expected: any;
  only?: boolean;
}

type TestSuite = Record<string, Test>;

const emptyContext = createEmptyContext();

function runTests(tests: TestSuite) {
  for (const [name, test] of Object.entries(tests)) {
    const { input, expected, context, only } = test;
    const ctx = { ...emptyContext, ...context };
    const testFn = only ? it.only : it;
    testFn(name, () => {
      const expression = ExpressionParser.tryParse(input);
      expect(expression.calc(ctx)).toEqual(expected);
    });
  }
}

describe("Expression Parser", () => {
  describe("Constants", () => {
    const tests: TestSuite = {
      "parses integers": {
        input: "4",
        expected: 4,
      },
      "parses floating point numbers": {
        input: "1.2",
        expected: 1.2,
      },
      "parses negative numbers": {
        input: "-4",
        expected: -4,
      },
      "parses strings with double quotes": {
        input: '"hello world"',
        expected: "hello world",
      },
      "parses strings with single quotes": {
        input: "'hello world'",
        expected: "hello world",
      },
      "parses strings with backticks": {
        input: "`hello world`",
        expected: "hello world",
      },
      "parses the empty string": {
        input: '""',
        expected: "",
      },
      "parses true": {
        input: "true",
        expected: true,
      },
      "parses false": {
        input: "false",
        expected: false,
      },
      "parses null": {
        input: "null",
        expected: null,
      },
      "parses the string `null`": {
        input: '"null"',
        expected: "null",
      },
    };
    runTests(tests);
  });
  describe("Variable Reference", () => {
    const tests: TestSuite = {
      "references the value corresponding to the access path provided": {
        input: "$ctx['test']",
        context: { test: "abc123" },
        expected: "abc123",
      },
      "references the value on a scope": {
        input: "$ctx['test']['subtest']",
        context: {
          [SCOPES]: [{ id: "123", scope: { test: { subtest: "abc123" } } }],
        },
        expected: "abc123",
      },
    };
    runTests(tests);
  });
  describe("Lists", () => {
    const tests: TestSuite = {
      "parses lists of constants": {
        input: `[134, "hello", false, null]`,
        expected: [134, "hello", false, null],
      },
      "parses variable references inside of a list": {
        input: `[$ctx['foo'], $ctx['bar']]`,
        context: { foo: "test", bar: 535 },
        expected: ["test", 535],
      },
      "parses function calls inside of a list": {
        input: `[14, $ctx["addAll"](2, 3, 5), 17]`,
        context: {
          addAll(...args: number[]) {
            let num = 0;
            for (const arg of args) {
              num += arg;
            }
            return num;
          },
        },
        expected: [14, 10, 17],
      },
    };
    runTests(tests);
  });
  describe("Function calls", () => {
    const tests: TestSuite = {
      "calls the function referenced with the arguments provided": {
        input: '$ctx["call"](3, "a", true)',
        context: {
          call(num: number, str: string, bool: boolean) {
            return `It's ${bool} that I said ${str} ${num} times`;
          },
        },
        expected: "It's true that I said a 3 times",
      },
      "supports expressions inside the function call": {
        input: "$ctx['call'](7 * $ctx['exp'](2, 3))",
        context: {
          call(val: number) {
            return val;
          },
          exp(base: number, exp: number) {
            return base ** exp;
          },
        },
        expected: 56,
      },
    };
    runTests(tests);
  });
  describe("Parentheses", () => {
    const tests: TestSuite = {
      "references the value wrapped by parentheses": {
        input: "(3)",
        expected: 3,
      },
      "handles arbitrary nesting": {
        input: "(((5)))",
        expected: 5,
      },
    };
    runTests(tests);
  });
  describe("Negation", () => {
    const tests: TestSuite = {
      "returns the logical opposite of the value": {
        input: "!false",
        expected: true,
      },
    };
    runTests(tests);
  });
  describe("Math", () => {
    const tests: TestSuite = {
      "adds two numbers together": {
        input: "1 + 3",
        expected: 4,
      },
      "subtracts two numbers": {
        input: "15 - 3",
        expected: 12,
      },
      "multiplies two numbers": {
        input: "4 * 6",
        expected: 24,
      },
      "divides two numbers": {
        input: "57 / 19",
        expected: 3,
      },
      "takes the modulo of two numbers": {
        input: "13 % 4",
        expected: 1,
      },
      "operates with variable references": {
        input: "$ctx['num'] + 5",
        context: { num: 7 },
        expected: 12,
      },
      "operates with parentheticals": {
        input: "6 * (1 + 5)",
        expected: 36,
      },
      "chains without parentheses": {
        input: "1 + 7 * 4 - 2 / 2",
        expected: 28,
      },
    };
    runTests(tests);
  });
  describe("Logic", () => {
    const tests: TestSuite = {
      "supports less than operator": {
        input: "1 lt 3",
        expected: true,
      },
      "supports greater than operator": {
        input: "1 gt 3",
        expected: false,
      },
      "supports the less than or equal to operator": {
        input: "1 lte 3",
        expected: true,
      },
      "supports the greater than or equal to operator": {
        input: "1 gte 3",
        expected: false,
      },
      "supports the equality operator": {
        input: "2 eq 2",
        expected: true,
      },
      "supports the inequality operator": {
        input: "2 neq 2",
        expected: false,
      },
      "supports the boolean AND operator": {
        input: "true and false",
        expected: false,
      },
      "supports the boolean OR operator": {
        input: "true or false",
        expected: true,
      },
      "operates with variable references": {
        input: "$ctx['num'] gt 5",
        context: { num: 7 },
        expected: true,
      },
      "operates with parentheticals": {
        input: "true AND (false OR true)",
        expected: true,
      },
      "chains without parentheses": {
        input: "1 lt 2 + 32 * 7 and 3 gt 4 eq true or `hello` neq `hi`",
        expected: true,
      },
    };
    runTests(tests);
  });
  describe("Ternary", () => {
    const tests: TestSuite = {
      "returns the first expression when the condition is true": {
        input: "true ? 1 : 2",
        expected: 1,
      },
      "returns the second expression when the condition is false": {
        input: "false ? 1 : 2",
        expected: 2,
      },
      "supports complex conditions": {
        input:
          '(($ctx["test"] gt 5) and ($ctx["other"] neq 13)) ? "hello" : "goodbye"',
        context: { test: 7, other: 21 },
        expected: "hello",
      },
      "supports complex conditions without parentheses": {
        input:
          '$ctx["test"] gt 5 and $ctx["other"] neq 13 ? "hello" : "goodbye"',
        context: { test: 7, other: 21 },
        expected: "hello",
      },
      "supports arbitrary nesting of ternary expressions": {
        input: '1 gt 5 ? "hello" : 3 lte 4 ? "whatever" : "goodbye"',
        expected: "whatever",
      },
    };
    runTests(tests);
  });
  describe("Interpolation helpers", () => {
    it("parses, evaluates, and replaces expressions inside double curly braces", () => {
      const str =
        'Hello, {{$ctx["name"]}}! You have {{$ctx["itemCount"]}} {{($ctx["itemCount"] eq 1) ? "item" : "items" }}';

      const context = {
        ...createEmptyContext(),
        name: "Test",
        itemCount: 3,
      };

      expect(evalAndReplace(context as any, str)).toEqual(
        "Hello, Test! You have 3 items"
      );
    });
    it("extracts the expressions from inside double curly braces in a string", () => {
      const str =
        'Hello, {{$ctx["name"]}}! You have {{$ctx["itemCount"]}} {{($ctx["itemCount"] eq 1) ? "item" : "items" }}';

      const expressions = parseAll(str);

      expect(expressions).toHaveLength(3);
      expect(expressions[0].constructor.name).toEqual("VariableRef");
      expect(expressions[1].constructor.name).toEqual("VariableRef");
      expect(expressions[2].constructor.name).toEqual("Ternary");
    });
    it("injects the output of a list of expressions into a given interpolated string", () => {
      const str =
        'Hello, {{$ctx["name"]}}! You have {{$ctx["itemCount"]}} {{($ctx["itemCount"] eq 1) ? "item" : "items" }}';

      const expressions = parseAll(str);
      const context = {
        ...createEmptyContext(),
        name: "Test",
        itemCount: 3,
      };

      expect(replaceWithParsedExpressions(context, expressions, str)).toEqual(
        "Hello, Test! You have 3 items"
      );
    });
  });
});
