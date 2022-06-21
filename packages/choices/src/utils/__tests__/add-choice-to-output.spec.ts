import { createEmptyContext } from "@story-machines/core";
import { Choice } from "../../types";
import { addChoiceToOutput } from "../add-choice-to-output";

describe("addChoiceToOutput", () => {
  it("adds the provided choice to the output", () => {
    const choice: Choice = {
      id: "abc123",
      text: "Test choice",
      metadata: {},
    };
    const context = createEmptyContext();
    context.output.choices = [];
    addChoiceToOutput(context, choice);
    expect(context.output.choices).toEqual([choice]);
  });
  it("creates a choices array in output if one does not already exist", () => {
    const choice: Choice = {
      id: "abc123",
      text: "Test choice",
      metadata: {},
    };
    const context = createEmptyContext();
    addChoiceToOutput(context, choice);
    expect(context.output.choices).toEqual([choice]);
  });
});
