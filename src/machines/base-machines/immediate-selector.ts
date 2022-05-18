import { SimpleCompositeMachine } from "../base-classes/simple-composite-machine";
import { Context, Result } from "../../types";

export class ImmediateSelector extends SimpleCompositeMachine {
  process(context: Context): Result {
    const results = this.children.map((child) => child.process(context));

    if (results.every((result) => result.status === "Terminated")) {
      return { status: "Terminated" };
    }
    if (results.some((result) => result.status === "Completed")) {
      return { status: "Completed" };
    }

    return { status: "Running" };
  }
}
