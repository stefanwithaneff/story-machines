import { Context, Result } from "../../types";
import {
  StoryMachine,
  StoryMachineCompiler,
} from "../base-classes/story-machine";

export class Terminated extends StoryMachine {
  process(context: Context): Result {
    return { status: "Terminated" };
  }
}

export const TerminatedCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    return new Terminated({});
  },
};
