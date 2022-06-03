import { getOutputBuilder } from "../../utils/output-builder";
import { Context, Result } from "../../types";
import { StoryMachine } from "../base-classes/story-machine";
import { ExpressionParser } from "../../utils/expression-parser";

interface AddTextContext extends Context {
  displayText?: string;
}

export class AddText extends StoryMachine {
  process(context: AddTextContext): Result {
    const builder = getOutputBuilder(context);
    const { displayText } = context;
    const textToAdd = this.attrs.textContent ?? displayText;

    if (!textToAdd) {
      return { status: "Terminated" };
    }
    try {
      const parsedText = textToAdd.replace(/{{([^}]*)}}/g, (_, match) =>
        ExpressionParser.tryParse(match).calc(context)
      );

      builder.addText(parsedText);
    } catch (e) {
      return { status: "Terminated" };
    }
    return { status: "Completed" };
  }
}
