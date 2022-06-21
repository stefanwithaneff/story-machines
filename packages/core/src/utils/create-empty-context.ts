import { string } from "parsimmon";
import { SCOPES } from "../machines/context";
import { Context, Input } from "../types";

interface ExternalContext extends Record<string, any> {
  input?: Input;
}

export function createEmptyContext(externalContext?: ExternalContext): Context {
  return {
    ...externalContext,
    output: {
      effects: [],
    },
    [SCOPES]: [],
  };
}
