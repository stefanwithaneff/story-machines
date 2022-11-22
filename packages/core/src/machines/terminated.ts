import { Context, ElementTree, Result } from "../types";
import { StoryMachine, StoryMachineClass } from "../base-classes";
import { StaticImplements } from "../utils/static-implements";
import { StoryMachineRuntime } from "../runtime";

@StaticImplements<StoryMachineClass>()
export class Terminated extends StoryMachine {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    return new Terminated({});
  }

  process(context: Context): Result {
    return { status: "Terminated" };
  }
}
