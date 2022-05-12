import { getOutputBuilder } from "../../utils/output-builder";
import { StoryMachine, StoryMachineRuntime } from "./story-machine";
import { Context, ProcessFn, ProcessorFactory } from "./types";

interface AddTextContext extends Context {
  displayText?: string;
}

export class AddText extends StoryMachine {
  protected generateProcessFn(): ProcessFn {
    return addText();
  }
}

export const addText: ProcessorFactory<[] | [string]> = (
  text?: string
): ProcessFn => {
  return (context: AddTextContext) => {
    const builder = getOutputBuilder(context);
    const { displayText } = context;
    const textToAdd = text ?? displayText;
    if (!textToAdd) {
      return { status: "Terminated" };
    }
    builder.addText(textToAdd);
    return { status: "Completed" };
  };
};

StoryMachineRuntime.registerMachines(AddText);
