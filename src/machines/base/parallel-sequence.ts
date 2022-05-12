import { StoryMachineRuntime, SimpleCompositeMachine } from "./story-machine";
import { CompositeFactory, ProcessFn, Context, Result } from "./types";

export class ParallelSequence extends SimpleCompositeMachine {
  protected generateProcessFn(): ProcessFn {
    return parallelSequence(this.nodes.map((node) => node.process));
  }
}

export const parallelSequence: CompositeFactory = (
  fns: ProcessFn[]
): ProcessFn => {
  return (context: Context): Result => {
    // TODO: Should this try to run every node every time? Or should it short circuit?
    const results = fns.map((fn) => fn(context));

    if (results.some((result) => result.status === "Terminated")) {
      return { status: "Terminated" };
    }
    if (results.every((result) => result.status === "Completed")) {
      return { status: "Completed" };
    }

    // TODO: If none are running, then Idle?
    return { status: "Running" };
  };
};

StoryMachineRuntime.registerMachines(ParallelSequence);
