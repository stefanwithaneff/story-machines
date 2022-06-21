import { get, set, toPath } from "lodash";
import { SCOPES } from "../machines/context";
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

export function findMatchingScope(
  context: Context,
  key: string | string[],
  existsHintLength: number
) {
  const keyPath = Array.isArray(key) ? key : toPath(key);
  const existencePath = keyPath.slice(0, existsHintLength);

  let matchingScope: Record<string, any> | undefined;

  // Search existing scopes for a matching key
  for (const { scope } of context[SCOPES]) {
    const prevValue = get(scope, existencePath);

    if (prevValue !== undefined) {
      matchingScope = scope;
    }
  }

  // Check global context for a matching key
  const globalVal = get(context, existencePath);
  if (globalVal !== undefined) {
    matchingScope = context;
  }

  return matchingScope;
}

export function setOnContext(
  context: Context,
  key: string | string[],
  val: any
) {
  const scope = context[SCOPES].length > 0 ? context[SCOPES][0].scope : context;

  set(scope, key, val);
}

export function updateContext(
  context: Context,
  key: string | string[],
  val: any,
  existsHintLength: number = 1
) {
  const matchingScope = findMatchingScope(context, key, existsHintLength);

  if (!matchingScope) {
    throw new Error(`Key ${key} does not exist on any scope or global context`);
  }

  set(matchingScope, key, val);
}
