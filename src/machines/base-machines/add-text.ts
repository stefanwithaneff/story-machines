import { getOutputBuilder } from "../../utils/output-builder";
import { Context, Result, Choice } from "../../types";
import {
  StoryMachine,
  StoryMachineAttributes,
} from "../base-classes/story-machine";

interface AddTextContext extends Context {
  displayText?: string;
}

interface AddTextAttributes extends StoryMachineAttributes {
  text?: string;
}

export class AddText extends StoryMachine<AddTextAttributes> {
  process(context: AddTextContext): Result {
    const builder = getOutputBuilder(context);
    const { displayText } = context;
    const textToAdd = this.attrs.text ?? displayText;
    if (!textToAdd) {
      return { status: "Terminated" };
    }
    builder.addText(textToAdd);
    return { status: "Completed" };
  }
}
