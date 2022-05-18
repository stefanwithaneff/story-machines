import { CompositeMachine } from "../base-classes/composite-machine";
import { Context, Result } from "../../types";
import { StoryMachineCompiler } from "../base-classes/story-machine";

export class ImmediateSelector extends CompositeMachine {
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

export const ImmediateSelectorCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);
    return new ImmediateSelector({ ...tree.attributes, children });
  },
};
