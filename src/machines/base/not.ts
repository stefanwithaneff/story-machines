import { DecoratorMachine, StoryMachineRuntime } from "./story-machine";
import { Context, Result, ProcessFn, DecoratorFactory } from "./types";

export class Not extends DecoratorMachine {
  protected generateProcessFn(): ProcessFn {
    return not(this.node.process);
  }
}

export const not: DecoratorFactory = (fn: ProcessFn): ProcessFn => {
  return (context: Context): Result => {
    const result = fn(context);
    if (result.status === "Terminated") {
      return { status: "Completed" };
    } else if (result.status === "Completed") {
      return { status: "Terminated" };
    }

    return { status: "Running" };
  };
};

StoryMachineRuntime.registerMachines(Not);
