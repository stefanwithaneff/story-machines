import { Context, ElementTree, Result } from "../types";
import { CompositeMachine, StoryMachineClass } from "../base-classes";
import { StoryMachineRuntime } from "../runtime";
import { StaticImplements } from "../utils/static-implements";

@StaticImplements<StoryMachineClass>()
export class Fallback extends CompositeMachine {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { children } = runtime.compileChildElements(tree.elements);
    return new Fallback({ ...tree.attributes, children });
  }

  process(context: Context): Result {
    for (const child of this.children) {
      const result = child.process(context);
      if (result.status === "Running" || result.status === "Completed") {
        return result;
      }
    }
    return { status: "Terminated" };
  }
}
