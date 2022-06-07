import { DecoratorMachine } from "../base-classes/decorator-machine";
import { Context, Result } from "../../types";
import { StoryMachineCompiler } from "../base-classes/story-machine";

interface Scope {
  id: string;
  scope: Record<string, any>;
}

export interface ScopedContext extends Context {
  __SCOPES__?: Scope[];
}

export function getFromScope(context: ScopedContext, key: string) {
  if (!context.__SCOPES__) {
    return null;
  }

  for (const { scope } of context.__SCOPES__) {
    if (scope[key]) {
      return scope[key];
    }
  }

  return null;
}

export class Scoped extends DecoratorMachine {
  process(context: ScopedContext): Result {
    if (!context.__SCOPES__) {
      context.__SCOPES__ = [];
    }

    const newScope = { id: this.id, scope: {} };

    context.__SCOPES__.unshift(newScope);

    const result = this.child.process(context);

    context.__SCOPES__.shift();

    return result;
  }
}

export const ScopedCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const [child] = runtime.compileChildElements(tree.elements);
    return new Scoped({ child });
  },
};
