import { Context } from "@story-machines/core";
import { Choice } from "../types";

export function addChoiceToOutput(context: Context, choice: Choice) {
  const choices: Choice[] | undefined = context.output.choices;

  if (!choices) {
    context.output.choices = [choice];
    return;
  }
  choices.push(choice);
}
