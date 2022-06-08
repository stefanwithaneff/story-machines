import { Context, Result } from "../../types";
import { StoryMachine } from "../base-classes/story-machine";

export class PassageMetadata extends StoryMachine {
  process(context: Context): Result {
    return { status: "Terminated" };
  }
}
