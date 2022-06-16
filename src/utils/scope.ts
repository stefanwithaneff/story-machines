import { get, set, toPath } from "lodash";
import { SCOPES } from "../machines/context/constants";
import { Context } from "../types";

export function getFromContext(context: Context, key: string | string[]) {
  const keyPath = Array.isArray(key) ? key : toPath(key);
  for (const { scope } of context[SCOPES]) {
    const val = get(scope, keyPath);
    if (val !== undefined) {
      return val;
    }
  }

  const globalVal = get(context, keyPath);

  return globalVal !== undefined ? globalVal : null;
}

export function setOnContext(
  context: Context,
  key: string | string[],
  val: any,
  existsHintLength: number = 1
) {
  const keyPath = Array.isArray(key) ? key : toPath(key);
  const existencePath = existsHintLength
    ? keyPath.slice(0, existsHintLength)
    : keyPath;
  let matchingScope: Record<string, any>;

  // Search existing scopes for a matching key
  for (const { scope } of context[SCOPES]) {
    const prevValue = get(scope, existencePath);

    if (prevValue !== undefined) {
      matchingScope = scope;
    }
  }

  // Check global context for a matching key
  const globalVal = get(context, existencePath);
  if (globalVal !== undefined || context[SCOPES].length === 0) {
    matchingScope = context;
  } else {
    // Use the most local existing scope if no other scope matches
    matchingScope = context[SCOPES][0].scope;
  }

  set(matchingScope, keyPath, val);
}
