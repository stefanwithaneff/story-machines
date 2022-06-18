import {
  getFromContext,
  Context,
  Result,
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
  createDevWarnEffect,
  addEffectToOutput,
} from "@story-machines/core";
import { addChoiceToOutput } from "../utils/add-choice-to-output";
import { Choice } from "../types";
import { CHOICE_ID, CHOICE_METADATA, CHOICE_TEXT } from "./constants";

interface AddChoiceContext extends Context {
  choiceText?: string;
  choiceId?: string;
  choiceMetadata?: Record<string, any>;
}

interface AddChoiceInternalAttributes extends StoryMachineAttributes {
  choice: Choice;
}

export class AddChoiceInternal extends StoryMachine<AddChoiceInternalAttributes> {
  process(context: Context): Result {
    addChoiceToOutput(context, this.attrs.choice);
    return { status: "Completed" };
  }
}

export class AddChoice extends StoryMachine {
  process(context: AddChoiceContext): Result {
    const choiceText = getFromContext(context, CHOICE_TEXT);
    const choiceId = getFromContext(context, CHOICE_ID);
    const choiceMetadata = getFromContext(context, CHOICE_METADATA);
    if (!choiceText || !choiceId) {
      addEffectToOutput(
        context,
        createDevWarnEffect({ message: "Choice ID or text missing" })
      );
      return { status: "Terminated" };
    }

    addChoiceToOutput(context, {
      id: choiceId,
      text: choiceText,
      metadata: choiceMetadata ?? {},
    });
    return { status: "Completed" };
  }
}

export const AddChoiceCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    return new AddChoice({ ...tree.attributes });
  },
};
