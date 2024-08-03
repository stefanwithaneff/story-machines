import { Context } from "../../types";
import { GLOBAL_FILES_CONTEXT_KEY } from "./constants";

export function getFileFromContext(
  context: Context,
  src: string
): string | undefined {
  return context[GLOBAL_FILES_CONTEXT_KEY]?.[src];
}

export function setFileOnContext(
  ctx: Context,
  src: string,
  contents: string
): void {
  if (!ctx[GLOBAL_FILES_CONTEXT_KEY]) {
    ctx[GLOBAL_FILES_CONTEXT_KEY] = {};
  }
  ctx[GLOBAL_FILES_CONTEXT_KEY][src] = contents;
}
