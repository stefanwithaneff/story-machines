import { CompositeMachine, StoryMachineClass } from "../base-classes";
import { StoryMachineRuntime } from "../runtime";
import { Context, ElementTree, Result } from "../types";
import { StaticImplements } from "../utils/static-implements";

@StaticImplements<StoryMachineClass>()
export class ImmediateFallback extends CompositeMachine {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { children } = runtime.compileChildElements(tree.elements);
    return new ImmediateFallback({ ...tree.attributes, children });
  }

  process(context: Context): Result {
    const results = this.children.map((child) => child.process(context));

    if (results.every((result) => result.status === "Terminated")) {
      return { status: "Terminated" };
    }
    if (results.some((result) => result.status === "Completed")) {
      return { status: "Completed" };
    }

    return { status: "Running" };
  }
}
