import { CompositeMachine, StoryMachineClass } from "../base-classes";
import { StoryMachineRuntime } from "../runtime";
import { Context, ElementTree, Result } from "../types";
import { StaticImplements } from "../utils/static-implements";

@StaticImplements<StoryMachineClass>()
export class Sequence extends CompositeMachine {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { children } = runtime.compileChildElements(tree.elements);
    return new Sequence({ ...tree.attributes, children });
  }

  process(context: Context): Result {
    for (const child of this.children) {
      const result = child.process(context);
      if (result.status === "Running" || result.status === "Terminated") {
        return result;
      }
    }
    return { status: "Completed" };
  }
}
