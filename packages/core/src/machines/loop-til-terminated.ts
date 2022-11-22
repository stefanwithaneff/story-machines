import { DecoratorMachine } from "../base-classes";
import { StoryMachineRuntime } from "../runtime";
import { Context, ElementTree, Result } from "../types";

export class LoopTilTerminated extends DecoratorMachine {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { children } = runtime.compileChildElements(tree.elements);
    return new LoopTilTerminated({ ...tree.attributes, child: children[0] });
  }

  process(context: Context): Result {
    const result = this.child.process(context);
    if (result.status === "Terminated") {
      return { status: "Completed" };
    }
    return { status: "Running" };
  }
}
