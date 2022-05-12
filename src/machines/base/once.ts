import { DecoratorMachine, StoryMachineRuntime } from "./story-machine";
import {
  Context,
  Result,
  StoryMachineStatus,
  ProcessFn,
  DecoratorFactory,
} from "./types";

export class Once extends DecoratorMachine {
  protected generateProcessFn(): ProcessFn {
    return once(this.node.process);
  }
}

export const once: DecoratorFactory = (fn: ProcessFn): ProcessFn => {
  let status: StoryMachineStatus | undefined;

  return (context: Context): Result => {
    if (status === "Running" || status === undefined) {
      const result = fn(context);
      status = result.status;
      return result;
    }

    return { status };
  };
};

StoryMachineRuntime.registerMachines(Once);
