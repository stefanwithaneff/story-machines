import { SimpleCompositeMachine } from "../base-classes/simple-composite-machine";
import { Context, Result } from "../../types";

export class Selector extends SimpleCompositeMachine {
  process(context: Context): Result {
    for (const child of this.children) {
      const result = child.process(context);
      if (result.status === "Running" || result.status === "Completed") {
        return result;
      }
    }
    return { status: "Terminated" };
  }
}