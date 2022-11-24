import { StoryMachineCompiler } from "@story-machines/core";
import { ChoiceMachine, Choices, ChoiceGroup } from "./machines";

export * from "./machines";
export * from "./utils/add-choice-to-output";
export * from "./utils/choice-test-player";
export * from "./types";

export const ChoiceElements: Record<string, StoryMachineCompiler> = {
  Choice: ChoiceMachine,
  Choices,
  ChoiceGroup,
};
