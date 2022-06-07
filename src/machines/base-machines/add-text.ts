import { getOutputBuilder } from "../../utils/output-builder";
import { Context, Result } from "../../types";
import { StoryMachine } from "../base-classes/story-machine";
import { evalAndReplace } from "../../utils/expression-parser";
import { createDevErrorEffect } from "../effects/dev-error";

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
      const parsedText = evalAndReplace(context, textToAdd);

      builder.addText(parsedText);
    } catch (e) {
      builder.addEffect(
        createDevErrorEffect({
          message: `Failed to parse choice: ${e.message}`,
        })
      );
      return { status: "Terminated" };
    }
    return { status: "Completed" };
  }
}
