import { getOutputBuilder } from "../../utils/output-builder";
import { Context, Result, Choice } from "../../types";
import {
  StoryMachine,
  StoryMachineAttributes,
} from "../base-classes/story-machine";

interface AddChoiceContext extends Context {
  displayText?: string;
  choiceId?: string;
  metadata?: Record<string, any>;
}

interface AddChoiceAttributes extends StoryMachineAttributes {
  choice?: Choice;
}

export class AddChoice extends StoryMachine<AddChoiceAttributes> {
  process(context: AddChoiceContext): Result {
    let choiceToAdd: Choice;
    if (this.attrs.choice) {
      choiceToAdd = this.attrs.choice;
    } else {
      const { displayText, choiceId, metadata } = context;
      if (!displayText || !choiceId) {
        return { status: "Terminated" };
      }
      choiceToAdd = {
        id: choiceId,
        text: displayText,
        metadata: metadata ?? {},
      };
    }
    const builder = getOutputBuilder(context);
    builder.addChoice(choiceToAdd);
    return { status: "Completed" };
  }
}
