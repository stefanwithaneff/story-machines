import { Context, Result } from "../../types";
import { DecoratorMachine, StoryMachineCompiler } from "../../base-classes";
import { SCOPES } from "./constants";

interface Scope {
  id: string;
  scope: Record<string, any>;
}

export class Scoped extends DecoratorMachine {
  process(context: Context): Result {
    const newScope: Scope = { id: this.id, scope: {} };

    context[SCOPES].unshift(newScope);

    const result = this.child.process(context);

    context[SCOPES].shift();

    return result;
  }
}

export const ScopedCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const [child] = runtime.compileChildElements(tree.elements);
    return new Scoped({ child });
  },
};
