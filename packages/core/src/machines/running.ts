import { StoryMachine, StoryMachineClass } from "../base-classes";
import { StoryMachineRuntime } from "../runtime";
import { ElementTree, Result } from "../types";
import { StaticImplements } from "../utils/static-implements";

@StaticImplements<StoryMachineClass>()
export class Running extends StoryMachine {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    return new Running({ ...tree.attributes });
  }

  process(): Result {
    return { status: "Running" };
  }
}
