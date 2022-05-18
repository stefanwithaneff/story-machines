import { CompositeMachine } from "../base-classes/composite-machine";
import { Context, Result } from "../../types";

export class Sequence extends CompositeMachine {
  process(context: Context): Result {
    for (const child of this.children) {
      const result = child.process(context);
      if (result.status === "Running" || result.status === "Terminated") {
        return result;
      }
    }
    return { status: "Completed" };
  }
}
