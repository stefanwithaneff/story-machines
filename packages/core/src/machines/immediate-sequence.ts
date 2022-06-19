import { CompositeMachine, StoryMachineCompiler } from "../base-classes";
import { Context, Result } from "../types";

export class ImmediateSequence extends CompositeMachine {
  process(context: Context): Result {
    const results = this.children.map((child) => child.process(context));

    if (results.some((result) => result.status === "Terminated")) {
      return { status: "Terminated" };
    }
    if (results.every((result) => result.status === "Completed")) {
      return { status: "Completed" };
    }

    return { status: "Running" };
  }
}

export const ImmediateSequenceCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);

    return new ImmediateSequence({ ...tree.attributes, children });
  },
};
