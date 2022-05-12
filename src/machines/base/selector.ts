import { SimpleCompositeMachine, StoryMachineRuntime } from "./story-machine";
import { CompositeFactory, ProcessFn, Context, Result } from "./types";

export class Selector extends SimpleCompositeMachine {
  protected generateProcessFn(): ProcessFn {
    return selector(this.nodes.map((node) => node.process));
  }
}

export const selector: CompositeFactory = (fns: ProcessFn[]): ProcessFn => {
  return (context: Context): Result => {
    for (const fn of fns) {
      const result = fn(context);
      if (result.status === "Running" || result.status === "Completed") {
        return result;
      }
    }
    return { status: "Terminated" };
  };
};

StoryMachineRuntime.registerMachines(Selector);
