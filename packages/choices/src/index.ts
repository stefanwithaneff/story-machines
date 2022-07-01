import { StoryMachineCompiler } from "@story-machines/core";
import {
  ChoiceCompiler,
  ChoiceMetadataCompiler,
  ChoicesCompiler,
  ChoiceTextCompiler,
  ChoiceGroupCompiler,
} from "./machines";

export * from "./machines";
export * from "./utils/add-choice-to-output";
export * from "./utils/choice-test-player";
export * from "./types";

export const ChoiceElements: Record<string, StoryMachineCompiler> = {
  Choice: ChoiceCompiler,
  Choices: ChoicesCompiler,
  ChoiceText: ChoiceTextCompiler,
  ChoiceMetadata: ChoiceMetadataCompiler,
  ChoiceGroup: ChoiceGroupCompiler,
};
