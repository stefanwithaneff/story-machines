import { Context, Result } from "../../types";
import {
  StoryMachine,
  StoryMachineCompiler,
} from "../base-classes/story-machine";

export class Completed extends StoryMachine {
  process(context: Context): Result {
    return { status: "Completed" };
  }
}

export const CompletedCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    return new Completed({});
  },
};
