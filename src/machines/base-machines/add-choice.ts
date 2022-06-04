import { getOutputBuilder } from "../../utils/output-builder";
import { Context, Result, Choice } from "../../types";
import {
  StoryMachine,
  StoryMachineAttributes,
} from "../base-classes/story-machine";
import {
  evalAndReplace,
  ExpressionParser,
} from "../../utils/expression-parser";

interface AddChoiceContext extends Context {
  choiceText?: string;
  choiceId?: string;
  choiceMetadata?: Record<string, any>;
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
      const { choiceText, choiceId, choiceMetadata } = context;
      if (!choiceText || !choiceId) {
        return { status: "Terminated" };
      }
      choiceToAdd = {
        id: choiceId,
        text: choiceText,
        metadata: choiceMetadata ?? {},
      };
    }
    try {
      const parsedText = evalAndReplace(context, choiceToAdd.text);
      const builder = getOutputBuilder(context);
      builder.addChoice({ ...choiceToAdd, text: parsedText });
    } catch (e) {
      return { status: "Terminated" };
    }
    return { status: "Completed" };
  }
}
