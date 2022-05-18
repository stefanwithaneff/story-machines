import { CompositeMachine } from "../base-classes/composite-machine";
import { Context, Result } from "../../types";
import { StoryMachineCompiler } from "../base-classes/story-machine";

export class Sequence extends CompositeMachine {
  process(context: Context): Result {
    console.log("ID >>", this.id);
    console.log("Children >>>", this.children);
    for (const child of this.children) {
      const result = child.process(context);
      console.log("Child >>>", child);
      console.log("Result >>>", result);
      if (result.status === "Running" || result.status === "Terminated") {
        return result;
      }
    }
    return { status: "Completed" };
  }
}

export const SequenceCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);
    return new Sequence({ ...tree.attributes, children });
  },
};
