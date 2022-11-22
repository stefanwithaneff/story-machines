import { DecoratorMachine, StoryMachineClass } from "../base-classes";
import { StoryMachineRuntime } from "../runtime";
import { Context, ElementTree, Result, StoryMachineStatus } from "../types";
import { StaticImplements } from "../utils/static-implements";

const invertedStatus: Record<StoryMachineStatus, StoryMachineStatus> = {
  Completed: "Terminated",
  Running: "Running",
  Terminated: "Completed",
};

@StaticImplements<StoryMachineClass>()
export class Not extends DecoratorMachine {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { children } = runtime.compileChildElements(tree.elements);
    return new Not({ ...tree.attributes, child: children[0] });
  }

  process(context: Context): Result {
    const result = this.child.process(context);

    return { status: invertedStatus[result.status] };
  }
}
