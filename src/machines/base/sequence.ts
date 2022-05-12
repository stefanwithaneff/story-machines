import { SimpleCompositeMachine, StoryMachineRuntime } from "./story-machine";
import { CompositeFactory, ProcessFn, Context, Result } from "./types";

export class Sequence extends SimpleCompositeMachine {
  protected generateProcessFn(): ProcessFn {
    return sequence(this.nodes.map((node) => node.process));
  }
}

export const sequence: CompositeFactory = (fns: ProcessFn[]): ProcessFn => {
  return (context: Context) => {
    for (const fn of fns) {
      const result = fn(context);
      if (result.status === "Running" || result.status === "Terminated") {
        return result;
      }
    }
    return { status: "Completed" };
  };
};

StoryMachineRuntime.registerMachines(Sequence);
