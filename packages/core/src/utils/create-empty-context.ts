import { SCOPES } from "../machines/context";
import { Context, Input } from "../types";

export function createEmptyContext(input?: Input): Context {
  return {
    output: {
      effects: [],
    },
    input,
    [SCOPES]: [],
  };
}
