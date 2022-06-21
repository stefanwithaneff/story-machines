import { SCOPES, STATE } from "../../machines";
import { Context } from "../../types";
import { createEmptyContext } from "../create-empty-context";
import { getFromContext, setOnContext, updateContext } from "../scope";

describe("Scope util functions", () => {
  describe("Getting values", () => {
    it("traverses the scope chain and returns a value if one is found matching the key", () => {
      const context: Context = {
        ...createEmptyContext(),
        [SCOPES]: [
          {
            id: "test1",
            scope: {},
          },
          {
            id: "test2",
            scope: {
              foo: "bar",
            },
          },
        ],
      };

      expect(getFromContext(context, "foo")).toEqual("bar");
    });

    it("checks the global context if the value does not exist on any scope", () => {
      const context: Context = {
        ...createEmptyContext(),
        foo: "bar",
        [SCOPES]: [
          {
            id: "test1",
            scope: {},
          },
          {
            id: "test2",
            scope: {},
          },
        ],
      };

      expect(getFromContext(context, "foo")).toEqual("bar");
    });

    it("returns null if the provided key is not found", () => {
      const context: Context = {
        ...createEmptyContext(),
        [SCOPES]: [
          {
            id: "test1",
            scope: {},
          },
          {
            id: "test2",
            scope: {},
          },
        ],
      };

      expect(getFromContext(context, "foo")).toEqual(null);
    });
  });
  describe("Setting values", () => {
    it("sets a value on the current scope if one exists", () => {
      const context: Context = {
        ...createEmptyContext(),
        [SCOPES]: [
          {
            id: "test1",
            scope: {},
          },
          {
            id: "test2",
            scope: {},
          },
        ],
      };

      setOnContext(context, "foo", "bar");

      expect(context[SCOPES][0].scope).toEqual({ foo: "bar" });
    });
    it("sets a value on the global context if no scope exists", () => {
      const context: Context = createEmptyContext();

      setOnContext(context, "foo", "bar");

      expect(context.foo).toEqual("bar");
    });
  });
  describe("Updating values", () => {
    it("checks for a scope with a matching key before updating the value", () => {
      const context: Context = {
        ...createEmptyContext(),
        [SCOPES]: [
          {
            id: "test1",
            scope: {},
          },
          {
            id: "test2",
            scope: { foo: "bar" },
          },
        ],
      };

      updateContext(context, "foo", "baz");

      expect(context[SCOPES][1].scope.foo).toEqual("baz");
    });
    it("checks the global context for a matching key before updating if there is no matching scope", () => {
      const context: Context = {
        ...createEmptyContext(),
        foo: "bar",
        [SCOPES]: [
          {
            id: "test1",
            scope: {},
          },
          {
            id: "test2",
            scope: {},
          },
        ],
      };

      updateContext(context, "foo", "baz");

      expect(context.foo).toEqual("baz");
    });
    it("throws an error if no key is present in any scope or the global context", () => {
      const context: Context = {
        ...createEmptyContext(),
        [SCOPES]: [
          {
            id: "test1",
            scope: {},
          },
          {
            id: "test2",
            scope: {},
          },
        ],
      };

      expect(() => updateContext(context, "foo", "baz")).toThrow();
    });
    it("uses a subset of the keypath to test existence of a provided key", () => {
      const context: Context = {
        ...createEmptyContext(),
        [SCOPES]: [
          {
            id: "test1",
            scope: {},
          },
          {
            id: "test2",
            scope: {
              [STATE]: {
                foo: {
                  bar: "baz",
                },
              },
            },
          },
        ],
      };

      updateContext(context, [STATE, "foo", "bar"], "fizz", 2);

      expect(context[SCOPES][1].scope[STATE].foo.bar).toEqual("fizz");
      expect(() => updateContext(context, [STATE, "bar"], "baz", 2)).toThrow();
    });
  });
});
