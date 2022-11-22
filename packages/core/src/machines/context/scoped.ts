import { Context, ElementTree, Result } from "../../types";
import { DecoratorMachine, StoryMachineClass } from "../../base-classes";
import { SCOPES } from "./constants";
import { StaticImplements } from "../../utils/static-implements";
import { StoryMachineRuntime } from "../../runtime";

interface Scope {
  id: string;
  scope: Record<string, any>;
}

@StaticImplements<StoryMachineClass>()
export class Scoped extends DecoratorMachine {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { children } = runtime.compileChildElements(tree.elements);
    return new Scoped({ ...tree.attributes, child: children[0] });
  }

  process(context: Context): Result {
    const newScope: Scope = { id: this.id, scope: {} };

    context[SCOPES].unshift(newScope);

    const result = this.child.process(context);

    context[SCOPES].shift();

    return result;
  }
}
