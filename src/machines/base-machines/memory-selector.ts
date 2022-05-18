import { CompositeMachine } from "../base-classes/composite-machine";
import { Context, Result, StoryMachineStatus } from "../../types";

export class MemorySelector extends CompositeMachine {
  private index = 0;
  private status: StoryMachineStatus = "Running";

  _process(context: Context): Result {
    for (; this.index < this.children.length; this.index++) {
      const child = this.children[this.index];
      const result = child.process(context);

      if (result.status === "Running" || result.status === "Completed") {
        return result;
      }
    }
    return { status: "Terminated" };
  }
  process(context: Context): Result {
    if (this.status !== "Running") {
      return { status: this.status };
    }
    const result = this._process(context);
    this.status = result.status;
    return result;
  }
}
