import { DecoratorMachine, StoryMachineCompiler } from "../base-classes";
import { Context, Result } from "../types";

export class LoopTilTerminated extends DecoratorMachine {
  process(context: Context): Result {
    const result = this.child.process(context);
    if (result.status === "Terminated") {
      return { status: "Completed" };
    }
    return { status: "Running" };
  }
}

export const LoopTilTerminatedCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const [child] = runtime.compileChildElements(tree.elements);
    return new LoopTilTerminated({ child });
  },
};
