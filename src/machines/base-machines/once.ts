import { DecoratorMachine } from "../base-classes/decorator-machine";
import { Context, Result, StoryMachineStatus } from "../../types";

export class Once extends DecoratorMachine {
  private status: StoryMachineStatus | undefined;
  process(context: Context): Result {
    if (this.status === "Running" || this.status === undefined) {
      const result = this.child.process(context);
      this.status = result.status;
      return result;
    }
    return { status: this.status };
  }
}
