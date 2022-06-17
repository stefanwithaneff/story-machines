import { SCOPES } from "../machines/context/constants";
import { Context, Input } from "../types";

export function createEmptyContext(input?: Input): Context {
  return {
    output: {
      passages: [],
      choices: [],
      effects: [],
    },
    input,
    [SCOPES]: [],
  };
}
