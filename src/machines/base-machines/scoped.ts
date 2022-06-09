import { Result } from "../../types";
import { SCOPES, ScopedContext } from "../../utils/scope";
import { DecoratorMachine } from "../base-classes/decorator-machine";
import { StoryMachineCompiler } from "../base-classes/story-machine";

interface Scope {
  id: string;
  scope: Record<string, any>;
}

export class Scoped extends DecoratorMachine {
  process(context: ScopedContext): Result {
    if (!context[SCOPES]) {
      context[SCOPES] = [];
    }

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
