import { getOutputBuilder } from "../../utils/output-builder";
import { Context, Result, Choice } from "../../types";
import {
  StoryMachine,
  StoryMachineAttributes,
} from "../base-classes/story-machine";

export class Wait extends StoryMachine {
  private hasRun: boolean = false;
  process(_: Context): Result {
    if (this.hasRun) {
      return { status: "Completed" };
    }
    this.hasRun = true;
    return { status: "Running" };
  }
}
