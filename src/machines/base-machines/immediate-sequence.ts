import { SimpleCompositeMachine } from "../base-classes/simple-composite-machine";
import { Context, Result } from "../../types";

export class ImmediateSequence extends SimpleCompositeMachine {
  process(context: Context): Result {
    let results: Result[] = [];
    for (const child of this.children) {
      const result = child.process(context);
      results.push(result);
      if (result.status === "Terminated") {
        return result;
      }
    }

    if (results.every((result) => result.status === "Completed")) {
      return { status: "Completed" };
    } else {
      return { status: "Running" };
    }
  }
}
