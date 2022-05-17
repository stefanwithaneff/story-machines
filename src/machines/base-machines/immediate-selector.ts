import { SimpleCompositeMachine } from "../base-classes/simple-composite-machine";
import { Context, Result } from "../../types";

export class ImmediateSelector extends SimpleCompositeMachine {
  process(context: Context): Result {
    let results: Result[] = [];
    for (const child of this.children) {
      const result = child.process(context);
      results.push(result);
      if (result.status === "Completed") {
        return result;
      }
    }

    if (results.every((result) => result.status === "Terminated")) {
      return { status: "Terminated" };
    } else {
      return { status: "Running" };
    }
  }
}
