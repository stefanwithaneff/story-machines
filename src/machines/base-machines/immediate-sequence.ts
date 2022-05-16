import { SimpleCompositeMachine } from "../base-classes/simple-composite-machine";
import { Context, Result } from "../../types";

export class ImmediateSequence extends SimpleCompositeMachine {
  process(context: Context): Result {
    const results = this.children.map((child) => child.process(context));

    if (results.some((result) => result.status === "Terminated")) {
      return { status: "Terminated" };
    }
    if (results.every((result) => result.status === "Completed")) {
      return { status: "Completed" };
    }

    return { status: "Running" };
  }
}
