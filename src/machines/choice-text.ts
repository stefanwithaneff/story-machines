import { Context, Result } from "../types";
import { StoryMachine } from "./base-classes/story-machine";

export class ChoiceText extends StoryMachine {
  process(context: Context): Result {
    context.choiceText = this.attrs.textContent;
    return { status: "Completed" };
  }
}
