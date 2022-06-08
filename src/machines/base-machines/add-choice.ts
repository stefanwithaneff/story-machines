import { getOutputBuilder } from "../../utils/output-builder";
import { Context, Result, Choice } from "../../types";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { createDevWarnEffect } from "../effects/dev-warn";
import { getFromScope } from "./scoped";

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
    const builder = getOutputBuilder(context);
    builder.addChoice(this.attrs.choice);
    return { status: "Completed" };
  }
}

export class AddChoice extends StoryMachine {
  process(context: AddChoiceContext): Result {
    const choiceText =
      getFromScope(context, "choiceText") ?? context.choiceText;
    const choiceId = getFromScope(context, "choiceId") ?? context.choiceId;
    const choiceMetadata =
      getFromScope(context, "choiceMetadata") ?? context.choiceMetadata;
    const builder = getOutputBuilder(context);
    if (!choiceText || !choiceId) {
      builder.addEffect(
        createDevWarnEffect({ message: "Choice ID or text missing" })
      );
      return { status: "Terminated" };
    }

    builder.addChoice({
      id: choiceId,
      text: choiceText,
      metadata: choiceMetadata ?? {},
    });
    return { status: "Completed" };
  }
}

export const AddChoiceCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    return new AddChoice({});
  },
};
