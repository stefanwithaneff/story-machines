import { getOutputBuilder } from "../../utils/output-builder";
import { StoryMachine, StoryMachineRuntime } from "./story-machine";
import {
  ProcessorFactory,
  ProcessFn,
  Context,
  Result,
  ID,
  Choice,
} from "./types";

interface AddChoiceContext extends Context {
  displayText?: string;
  choiceId?: ID;
  metadata?: Record<string, any>;
}

export class AddChoice extends StoryMachine {
  protected generateProcessFn(): ProcessFn {
    return addChoice();
  }
}

export const addChoice: ProcessorFactory<[] | [Choice]> = (choice?: Choice) => {
  return (context: AddChoiceContext): Result => {
    let choiceToAdd: Choice;
    if (choice) {
      choiceToAdd = choice;
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
  };
};

StoryMachineRuntime.registerMachines(AddChoice);
