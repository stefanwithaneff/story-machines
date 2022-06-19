import { Context, ElementTree, Result } from "../types";
import {
  StoryMachine,
  StoryMachineCompiler,
  CompositeMachine,
} from "../base-classes";
import { StoryMachineRuntime } from "../runtime";

export class Fallback extends CompositeMachine {
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

export const FallbackCompiler: StoryMachineCompiler = {
  compile(runtime: StoryMachineRuntime, tree: ElementTree): StoryMachine<any> {
    const children = runtime.compileChildElements(tree.elements);
    return new Fallback({ ...tree.attributes, children });
  },
};
