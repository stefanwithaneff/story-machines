import { Context, Result } from "../../types";
import {
  StoryMachine,
  StoryMachineCompiler,
} from "../base-classes/story-machine";

export class ChoiceText extends StoryMachine {
  process(context: Context): Result {
    context.choiceText = this.attrs.textContent;
    return { status: "Completed" };
  }
}

export const ChoiceTextCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    return new ChoiceText({ textContent: tree.attributes.textContent });
  },
};
