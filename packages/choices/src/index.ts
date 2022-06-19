import { StoryMachineCompiler } from "@story-machines/core";
import {
  ChoiceCompiler,
  ChoiceMetadataCompiler,
  ChoicesCompiler,
  ChoiceTextCompiler,
  MultiChoiceCompiler,
} from "./machines";

export * from "./machines";
export * from "./utils/add-choice-to-output";
export * from "./types";

export const ChoiceElements: Record<string, StoryMachineCompiler> = {
  Choice: ChoiceCompiler,
  Choices: ChoicesCompiler,
  ChoiceText: ChoiceTextCompiler,
  ChoiceMetadata: ChoiceMetadataCompiler,
  MultiChoice: MultiChoiceCompiler,
};
