import { get, set } from "lodash";
import { Context } from "../types";

export interface Scope {
  id: string;
  scope: Record<string, any>;
}

export const SCOPES = "__SCOPES__";

export type ScopedContext = Context & Record<typeof SCOPES, Scope[]>;

export function isScopedContext(context: Context): context is ScopedContext {
  return Array.isArray(context[SCOPES]) && context[SCOPES].length > 0;
}

export function getFromScope(context: Context, key: string | string[]) {
  if (!isScopedContext(context)) {
    return null;
  }

  for (const { scope } of context[SCOPES]) {
    const val = get(scope, key);
    if (val !== undefined) {
      return val;
    }
  }

  return null;
}

export function setOnScope(context: Context, key: string | string[], val: any) {
  if (!isScopedContext(context)) {
    throw new Error("No scope defined");
  }

  const currentScope = context[SCOPES][0];
  set(currentScope.scope, key, val);
}
