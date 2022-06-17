import { DecoratorMachine } from "../base-classes/decorator-machine";
import { Context, Result, StoryMachineStatus } from "../../types";

const invertedStatus: Record<StoryMachineStatus, StoryMachineStatus> = {
  Completed: "Terminated",
  Running: "Running",
  Terminated: "Completed",
};

export class Not extends DecoratorMachine {
  process(context: Context): Result {
    const result = this.child.process(context);

    return { status: invertedStatus[result.status] };
  }
}
