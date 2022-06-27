import { StoryMachine, StoryMachineCompiler } from "../base-classes";
import { Result } from "../types";

export class Running extends StoryMachine {
  process(): Result {
    return { status: "Running" };
  }
}

export const RunningCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    return new Running({ ...tree.attributes });
  },
};
