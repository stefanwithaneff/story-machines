import { StoryMachineRuntime, SimpleCompositeMachine } from "./story-machine";
import { CompositeFactory, Context, Result, ProcessFn } from "./types";

export class ParallelSelector extends SimpleCompositeMachine {
  protected generateProcessFn(): ProcessFn {
    return parallelSelector(this.nodes.map((node) => node.process));
  }
}

export const parallelSelector: CompositeFactory = (
  fns: ProcessFn[]
): ProcessFn => {
  return (context: Context): Result => {
    // TODO: Should this try to run every node every time? Or should it short circuit?
    const results = fns.map((fn) => fn(context));

    if (results.every((result) => result.status === "Terminated")) {
      return { status: "Terminated" };
    }
    if (results.some((result) => result.status === "Completed")) {
      return { status: "Completed" };
    }

    // TODO: If none are running, then Idle?
    return { status: "Running" };
  };
};

StoryMachineRuntime.registerMachines(ParallelSelector);
