import { CompositeMachine, StoryMachineCompiler } from "../base-classes";
import { Context, Result } from "../types";

export class ImmediateFallback extends CompositeMachine {
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

export const ImmediateFallbackCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);
    return new ImmediateFallback({ ...tree.attributes, children });
  },
};
